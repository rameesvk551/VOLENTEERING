const HowItWorks = () => {
  return (
    <section className="py-16 bg-gray-100 text-center">
      <h2 className="text-3xl font-semibold mb-6">How It Works</h2>
      <div className="flex flex-col md:flex-row justify-center md:space-x-12 space-y-8 md:space-y-0 px-4">
        <div className="md:w-1/3">
          <h3 className="text-2xl mb-4">Step 1: Choose Gear</h3>
          <p>Select the gear you need for your adventure.</p>
        </div>
        <div className="md:w-1/3">
          <h3 className="text-2xl mb-4">Step 2: Book & Pay</h3>
          <p>Complete your booking and payment securely.</p>
        </div>
        <div className="md:w-1/3">
          <h3 className="text-2xl mb-4">Step 3: Enjoy Your Adventure</h3>
          <p>Pick up your gear and enjoy your journey!</p>
        </div>
      </div>
    </section>
  );
};
export default HowItWorks