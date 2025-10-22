import React from "react";
import Navbar from "../components/shared/Navbar";

const CompareDashboardPage: React.FC = () => {
	return (
		<>
			<Navbar />
			<main className="pt-24 pb-16 px-4 min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				{/* Hero Section */}
				<section className="text-center mb-16">
					<h1 className="text-5xl font-extrabold text-primary-700 dark:text-primary-400 mb-4 drop-shadow-lg">Compare Visas</h1>
					<p className="text-xl text-gray-700 dark:text-gray-200 mb-6 max-w-2xl mx-auto">Quickly compare visa requirements and travel options between countries. Make informed decisions for your next trip.</p>
				</section>

				{/* Feature Cards */}
				<section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
					<div className="card p-8 flex flex-col items-center text-center">
						<span className="text-5xl mb-4">🔄</span>
						<h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">Side-by-Side Comparison</h2>
						<p className="text-gray-600 dark:text-gray-300">View visa requirements for multiple countries at a glance.</p>
					</div>
					<div className="card p-8 flex flex-col items-center text-center">
						<span className="text-5xl mb-4">📊</span>
						<h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">Visual Insights</h2>
						<p className="text-gray-600 dark:text-gray-300">Charts and highlights make comparison easy and intuitive.</p>
					</div>
				</section>

				{/* Call to Action */}
				<section className="text-center mt-12">
					<a href="/explore" className="btn btn-primary text-lg">Explore More</a>
				</section>
			</main>
		</>
	);
};

export default CompareDashboardPage;
