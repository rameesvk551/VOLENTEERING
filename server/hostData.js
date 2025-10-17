const mongoose = require("mongoose");
const { faker } = require('@faker-js/faker');

const Host = require("./model/host"); 

const generateDummyHosts = async () => {
  try {
    const hosts = [];
    for (let i = 0; i < 50; i++) {
      hosts.push({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: faker.location.country(),
          zipCode: faker.location.zipCode(),
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
        description: faker.lorem.sentence(),
        selectedHelpTypes: [faker.lorem.word(), faker.lorem.word()],
        allowed: ["volunteers", "guests"],
        accepted: ["solo travelers", "groups"],
        languageDescription: faker.lorem.sentence(),
        languageAndLevel: [
          { language: "English", level: "Fluent" },
          { language: "Spanish", level: "Intermediate" }
        ],
        showIntreastInLanguageExchange: faker.datatype.boolean(),
        privateComment: faker.lorem.sentence(),
        organisation: faker.company.name(),
        password: "Test@123", // 🔒 Use hashing in real cases
        images: [
          {
            url: faker.image.urlPicsumPhotos(), // Generates a random image URL
            description: faker.lorem.sentence(),
          },
        ],
        minimumStay: faker.helpers.arrayElement(["No Minimum", "One Week", "One Month"]),
        maxHours: faker.helpers.arrayElement(["2-3 hours", "4-5 hours", "6+ hours"]),
        availability: faker.helpers.arrayElement(["Available", "Nearly Available", "Not Available"]),
        culturalExchange: faker.lorem.paragraph(),
        role: "host",
        isVerified: faker.datatype.boolean(),
      });
    }

    await Host.insertMany(hosts);
    console.log("✅ 100 Dummy Hosts Added Successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error generating dummy hosts:", error);
    mongoose.connection.close();
  }
};

generateDummyHosts();