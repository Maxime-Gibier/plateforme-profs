// Test script pour déboguer l'inscription
const testSignup = async () => {
  const testData = {
    email: "test@example.com",
    password: "password123",
    firstName: "Jean",
    lastName: "Dupont",
    role: "CLIENT",
    phone: "",
    address: ""
  };

  console.log("Envoi des données:", testData);

  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Réponse:", JSON.stringify(data, null, 2));

    if (data.details) {
      console.log("\nDétails des erreurs:");
      data.details.forEach(err => {
        console.log(`- Champ "${err.path[0]}": ${err.message}`);
      });
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
};

testSignup();
