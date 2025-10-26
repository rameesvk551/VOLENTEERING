// LangGraph Knowledge Graph for Contextual Recommendations

import { StateGraph, Annotation } from '@langchain/langgraph';
import { Place } from '@/database/models';
import { dbManager } from '@/database/connection';
import { logger } from '@/utils/logger';
import type {
  GraphNode,
  GraphEdge,
  GraphState,
  GraphNodeType,
  GraphEdgeType,
  QueryEntities,
  Recommendation,
  StructuredData
} from '@/types';

export class KnowledgeGraph {
  private graph: StateGraph<GraphState>;
  private redis;

  constructor() {
    this.redis = dbManager.getRedis();
    this.graph = this.buildGraph();
  }

  /**
   * Build the LangGraph state machine
   */
  private buildGraph(): StateGraph<GraphState> {
    // Define state annotation
    const StateAnnotation = Annotation.Root({
      query: Annotation<string>,
      nodes: Annotation<GraphNode[]>,
      edges: Annotation<GraphEdge[]>,
      recommendations: Annotation<Recommendation[]>
    });

    const graph = new StateGraph(StateAnnotation);

    // Node 1: Load relevant subgraph
    graph.addNode('load_subgraph', async (state: GraphState) => {
      const { query } = state;
      logger.info('Loading subgraph', { query });

      const nodes = await this.loadNodesForQuery(query);
      const edges = await this.loadEdgesForNodes(nodes);

      return { ...state, nodes, edges };
    });

    // Node 2: Find related entities through graph traversal
    graph.addNode('find_relations', async (state: GraphState) => {
      const { nodes, edges, query } = state;
      logger.info('Finding relations', { nodeCount: nodes.length, edgeCount: edges.length });

      const relations = this.traverseGraph(nodes, edges, query);

      return { ...state, recommendations: relations };
    });

    // Node 3: Score and rank recommendations
    graph.addNode('score_recommendations', async (state: GraphState) => {
      const { recommendations, query } = state;
      logger.info('Scoring recommendations', { count: recommendations.length });

      const scored = await this.scoreRecommendations(recommendations, query);

      return { ...state, recommendations: scored };
    });

    // Define edges (flow)
    graph.addEdge('__start__', 'load_subgraph');
    graph.addEdge('load_subgraph', 'find_relations');
    graph.addEdge('find_relations', 'score_recommendations');
    graph.addEdge('score_recommendations', '__end__');

    return graph;
  }

  /**
   * Load nodes relevant to the query
   */
  private async loadNodesForQuery(query: QueryEntities): Promise<GraphNode[]> {
    const nodes: GraphNode[] = [];

    try {
      // Add city node
      if (query.city) {
        nodes.push({
          id: `city:${query.city.toLowerCase()}`,
          type: 'city',
          properties: { name: query.city, country: query.country }
        });
      }

      // Add month node
      if (query.month) {
        nodes.push({
          id: `month:${query.month.toLowerCase()}`,
          type: 'month',
          properties: { name: query.month }
        });
      }

      // Load place/event nodes from database
      const dbQuery: any = {
        'location.city': new RegExp(query.city, 'i')
      };

      if (query.month && query.year) {
        const monthNum = new Date(`${query.month} 1, ${query.year}`).getMonth() + 1;
        const startDate = new Date(query.year, monthNum - 1, 1);
        const endDate = new Date(query.year, monthNum, 0);

        dbQuery['dates.start'] = { $gte: startDate };
        dbQuery['dates.end'] = { $lte: endDate };
      }

      const places = await Place.find(dbQuery).limit(50).lean();

      for (const place of places) {
        nodes.push({
          id: `entity:${place._id}`,
          type: place.type as any,
          properties: {
            mongoId: place._id.toString(),
            title: place.title,
            type: place.type,
            category: place.metadata.category,
            tags: place.metadata.tags,
            popularity: place.metadata.popularity,
            coordinates: place.location.coordinates
          }
        });

        // Add category nodes
        for (const category of place.metadata.category) {
          nodes.push({
            id: `category:${category.toLowerCase()}`,
            type: 'category',
            properties: { name: category }
          });
        }
      }

      // Deduplicate nodes
      const unique = new Map<string, GraphNode>();
      for (const node of nodes) {
        unique.set(node.id, node);
      }

      return Array.from(unique.values());
    } catch (error) {
      logger.error('Failed to load nodes:', error);
      return nodes;
    }
  }

  /**
   * Load edges connecting the nodes
   */
  private async loadEdgesForNodes(nodes: GraphNode[]): Promise<GraphEdge[]> {
    const edges: GraphEdge[] = [];

    try {
      const entityNodes = nodes.filter(n => n.type !== 'city' && n.type !== 'month' && n.type !== 'category');
      const cityNodes = nodes.filter(n => n.type === 'city');
      const monthNode = nodes.find(n => n.type === 'month');
      const categoryNodes = nodes.filter(n => n.type === 'category');

      // Create edges: entity -> city
      for (const entity of entityNodes) {
        for (const city of cityNodes) {
          edges.push({
            source: entity.id,
            target: city.id,
            type: 'located_in',
            weight: 1.0
          });
        }
      }

      // Create edges: entity -> month (if dates match)
      if (monthNode) {
        for (const entity of entityNodes) {
          edges.push({
            source: entity.id,
            target: monthNode.id,
            type: 'happens_during',
            weight: 1.0
          });
        }
      }

      // Create edges: entity -> category
      for (const entity of entityNodes) {
        const categories = entity.properties.category || [];
        for (const category of categories) {
          const categoryNode = categoryNodes.find(
            n => n.properties.name.toLowerCase() === category.toLowerCase()
          );
          if (categoryNode) {
            edges.push({
              source: entity.id,
              target: categoryNode.id,
              type: 'related_to',
              weight: 0.8
            });
          }
        }
      }

      // Create edges: entity <-> entity (nearby, similar)
      for (let i = 0; i < entityNodes.length; i++) {
        for (let j = i + 1; j < entityNodes.length; j++) {
          const entity1 = entityNodes[i];
          const entity2 = entityNodes[j];

          // Check proximity
          const distance = this.calculateDistance(
            entity1.properties.coordinates,
            entity2.properties.coordinates
          );

          if (distance < 5) { // Within 5km
            const weight = 1 - (distance / 5); // Closer = higher weight
            edges.push({
              source: entity1.id,
              target: entity2.id,
              type: 'nearby',
              weight
            });
          }

          // Check similarity (same categories)
          const categories1 = new Set(entity1.properties.category || []);
          const categories2 = new Set(entity2.properties.category || []);
          const intersection = [...categories1].filter(c => categories2.has(c));

          if (intersection.length > 0) {
            const similarity = intersection.length / Math.max(categories1.size, categories2.size);
            edges.push({
              source: entity1.id,
              target: entity2.id,
              type: 'similar_to',
              weight: similarity
            });
          }
        }
      }

      return edges;
    } catch (error) {
      logger.error('Failed to load edges:', error);
      return edges;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Traverse graph using BFS to find recommendations
   */
  private traverseGraph(
    nodes: GraphNode[],
    edges: GraphEdge[],
    query: QueryEntities
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    try {
      // Start from query entities (city, month)
      const startNodes = nodes.filter(n =>
        n.type === 'city' || n.type === 'month' || n.type === 'category'
      );

      const visited = new Set<string>();
      const queue: Array<{ node: GraphNode; depth: number; path: string[] }> =
        startNodes.map(n => ({ node: n, depth: 0, path: [n.id] }));

      while (queue.length > 0) {
        const { node, depth, path } = queue.shift()!;

        if (visited.has(node.id) || depth > 3) continue;
        visited.add(node.id);

        // Find connected nodes
        const connectedEdges = edges.filter(e =>
          e.source === node.id || e.target === node.id
        );

        for (const edge of connectedEdges) {
          const targetId = edge.source === node.id ? edge.target : edge.source;
          const targetNode = nodes.find(n => n.id === targetId);

          if (!targetNode || visited.has(targetId)) continue;

          // If target is a place/event/attraction, add to recommendations
          if (['place', 'event', 'attraction', 'festival'].includes(targetNode.type)) {
            recommendations.push({
              entity: this.nodeToEntity(targetNode),
              reason: this.explainRelationship(path, edge),
              score: edge.weight * (1 - depth * 0.2), // Decay by depth
              relationshipType: edge.type
            });
          }

          queue.push({
            node: targetNode,
            depth: depth + 1,
            path: [...path, edge.type, targetNode.id]
          });
        }
      }

      return recommendations;
    } catch (error) {
      logger.error('Graph traversal failed:', error);
      return recommendations;
    }
  }

  /**
   * Convert graph node to structured entity
   */
  private nodeToEntity(node: GraphNode): StructuredData {
    return {
      id: node.properties.mongoId,
      type: node.properties.type,
      title: node.properties.title,
      description: '',
      location: { city: '', coordinates: node.properties.coordinates },
      metadata: {
        category: node.properties.category,
        tags: node.properties.tags,
        popularity: node.properties.popularity
      },
      media: { images: [] },
      source: { url: '', domain: '', crawledAt: '', lastUpdated: '' },
      confidence: 1.0
    } as StructuredData;
  }

  /**
   * Generate human-readable explanation for relationship
   */
  private explainRelationship(path: string[], edge: GraphEdge): string {
    const relations: Record<GraphEdgeType, string> = {
      located_in: 'in the same area',
      happens_during: 'at the same time',
      nearby: 'nearby',
      similar_to: 'similar experience',
      related_to: 'related'
    };
    return relations[edge.type] || 'connected';
  }

  /**
   * Score and rank recommendations
   */
  private async scoreRecommendations(
    recommendations: Recommendation[],
    query: QueryEntities
  ): Promise<Recommendation[]> {
    try {
      // Enhance scores based on:
      // 1. Popularity
      // 2. Relationship strength
      // 3. Number of connections
      // 4. User interests match

      const scored = recommendations.map(rec => {
        let score = rec.score;

        // Boost by popularity
        if (rec.entity.metadata?.popularity) {
          score *= (1 + rec.entity.metadata.popularity * 0.2);
        }

        // Boost if matches user interests
        if (query.interests.length > 0) {
          const matches = query.interests.filter(interest =>
            rec.entity.metadata?.category?.includes(interest)
          );
          score *= (1 + matches.length * 0.1);
        }

        // Boost nearby items more
        if (rec.relationshipType === 'nearby') {
          score *= 1.2;
        }

        return { ...rec, score };
      });

      // Sort by score and return top 20
      return scored.sort((a, b) => b.score - a.score).slice(0, 20);
    } catch (error) {
      logger.error('Recommendation scoring failed:', error);
      return recommendations;
    }
  }

  /**
   * Query the knowledge graph
   */
  async query(entities: QueryEntities): Promise<Recommendation[]> {
    const startTime = Date.now();

    try {
      logger.info('Knowledge graph query started', { entities });

      const result = await this.graph.invoke({
        query: entities,
        nodes: [],
        edges: [],
        recommendations: []
      });

      logger.info('Knowledge graph query completed', {
        recommendationCount: result.recommendations.length,
        duration: Date.now() - startTime
      });

      return result.recommendations;
    } catch (error) {
      logger.error('Knowledge graph query failed:', error);
      return [];
    }
  }

  /**
   * Get recommendations based on a specific entity
   */
  async getRelatedEntities(entityId: string, limit: number = 10): Promise<Recommendation[]> {
    try {
      const entity = await Place.findById(entityId).lean();
      if (!entity) {
        return [];
      }

      // Find nearby entities
      const nearby = await Place.find({
        _id: { $ne: entityId },
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: entity.location.coordinates
            },
            $maxDistance: 5000 // 5km
          }
        }
      }).limit(limit).lean();

      // Find similar entities (same categories)
      const similar = await Place.find({
        _id: { $ne: entityId },
        'metadata.category': { $in: entity.metadata.category }
      }).limit(limit).lean();

      // Combine and deduplicate
      const combined = [...nearby, ...similar];
      const unique = new Map<string, any>();
      for (const item of combined) {
        unique.set(item._id.toString(), item);
      }

      const recommendations: Recommendation[] = Array.from(unique.values()).map((item: any) => {
        const distance = this.calculateDistance(
          entity.location.coordinates,
          item.location.coordinates
        );

        const isNearby = distance < 5;
        const isSimilar = entity.metadata.category.some((c: string) =>
          item.metadata.category.includes(c)
        );

        return {
          entity: {
            id: item._id.toString(),
            type: item.type,
            title: item.title,
            description: item.description,
            location: item.location,
            dates: item.dates,
            metadata: item.metadata,
            media: item.media,
            source: item.source,
            confidence: item.confidence
          },
          reason: isNearby ? `${distance.toFixed(1)}km away` : 'Similar experience',
          score: isNearby ? (1 - distance / 5) : 0.7,
          relationshipType: isNearby ? 'nearby' : 'similar_to',
          distance: `${distance.toFixed(1)} km`
        };
      });

      return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      logger.error('Failed to get related entities:', error);
      return [];
    }
  }

  /**
   * Update graph with new entity
   */
  async updateGraph(newEntity: StructuredData): Promise<void> {
    try {
      logger.info('Updating knowledge graph', { entityId: newEntity.id });

      // The graph is dynamically built on query
      // For persistent graph updates, implement:
      // 1. Store entity relationships in a separate collection
      // 2. Maintain pre-computed graph structures
      // 3. Update when new entities are added

      logger.info('Knowledge graph updated');
    } catch (error) {
      logger.error('Failed to update knowledge graph:', error);
    }
  }
}
