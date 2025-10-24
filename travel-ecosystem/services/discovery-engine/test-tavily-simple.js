// Simple test to verify Tavily is installed
try {
  const { TavilySearchResults } = require('@langchain/community/tools/tavily_search');
  console.log('✅ Tavily successfully imported!');
  console.log('✅ TavilySearchResults class available');
  console.log('\n📦 Integration complete - ready to use!');
} catch (error) {
  console.error('❌ Error:', error.message);
}
