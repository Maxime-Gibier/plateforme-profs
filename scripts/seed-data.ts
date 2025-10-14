import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // 1. Créer ou récupérer le professeur Maxime Gibier
  console.log('\n📚 Création du professeur Maxime Gibier...');

  const professorEmail = 'maxime.gibier@test.com';
  let professor = await prisma.user.findUnique({
    where: { email: professorEmail },
  });

  if (!professor) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    professor = await prisma.user.create({
      data: {
        email: professorEmail,
        password: hashedPassword,
        firstName: 'Maxime',
        lastName: 'Gibier',
        role: 'PROFESSOR',
        phone: '+33 6 12 34 56 78',
        address: '123 Rue de la République, 75001 Paris',
      },
    });
    console.log(`✅ Professeur créé: ${professor.email}`);
  } else {
    console.log(`✅ Professeur existant: ${professor.email}`);
  }

  // 2. Créer des clients fictifs
  console.log('\n👥 Création des clients...');

  const clientsData = [
    {
      email: 'julie.martin@test.com',
      firstName: 'Julie',
      lastName: 'Martin',
      phone: '+33 6 23 45 67 89',
      address: '45 Avenue des Champs, 75008 Paris',
      subject: 'Mathématiques',
      level: 'Lycée - Terminale',
    },
    {
      email: 'thomas.dubois@test.com',
      firstName: 'Thomas',
      lastName: 'Dubois',
      phone: '+33 6 34 56 78 90',
      address: '12 Rue du Commerce, 75015 Paris',
      subject: 'Physique-Chimie',
      level: 'Lycée - Première',
    },
    {
      email: 'marie.bernard@test.com',
      firstName: 'Marie',
      lastName: 'Bernard',
      phone: '+33 6 45 67 89 01',
      address: '78 Boulevard Saint-Germain, 75005 Paris',
      subject: 'Français',
      level: 'Collège - 3ème',
    },
    {
      email: 'lucas.petit@test.com',
      firstName: 'Lucas',
      lastName: 'Petit',
      phone: '+33 6 56 78 90 12',
      address: '34 Rue de Rivoli, 75004 Paris',
      subject: 'Anglais',
      level: 'Lycée - Seconde',
    },
    {
      email: 'emma.rousseau@test.com',
      firstName: 'Emma',
      lastName: 'Rousseau',
      phone: '+33 6 67 89 01 23',
      address: '56 Avenue Victor Hugo, 75016 Paris',
      subject: 'Mathématiques',
      level: 'Collège - 4ème',
    },
  ];

  const clients = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const clientData of clientsData) {
    let client = await prisma.user.findUnique({
      where: { email: clientData.email },
    });

    if (!client) {
      client = await prisma.user.create({
        data: {
          email: clientData.email,
          password: hashedPassword,
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          role: 'CLIENT',
          phone: clientData.phone,
          address: clientData.address,
        },
      });
      console.log(`✅ Client créé: ${client.firstName} ${client.lastName}`);
    } else {
      console.log(`✅ Client existant: ${client.firstName} ${client.lastName}`);
    }

    clients.push({ ...client, subject: clientData.subject, level: clientData.level });
  }

  // 3. Créer des cours fictifs
  console.log('\n📅 Création des cours...');

  const now = new Date();
  const coursesData = [
    // Cours passés
    {
      title: 'Révision Bac Blanc',
      description: 'Préparation intensive pour le bac blanc de mathématiques',
      subject: 'Mathématiques',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
      duration: 90,
      price: 45,
      status: 'COMPLETED',
      clientIndex: 0, // Julie Martin
    },
    {
      title: 'Cours de Physique - Mécanique',
      description: 'Étude des forces et du mouvement',
      subject: 'Physique-Chimie',
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
      duration: 60,
      price: 35,
      status: 'COMPLETED',
      clientIndex: 1, // Thomas Dubois
    },
    {
      title: 'Analyse de texte - Zola',
      description: 'Préparation du commentaire de texte',
      subject: 'Français',
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
      duration: 60,
      price: 30,
      status: 'COMPLETED',
      clientIndex: 2, // Marie Bernard
    },
    // Cours à venir
    {
      title: 'Mathématiques - Suites et séries',
      description: 'Cours sur les suites numériques',
      subject: 'Mathématiques',
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
      duration: 90,
      price: 45,
      status: 'SCHEDULED',
      clientIndex: 0, // Julie Martin
    },
    {
      title: 'Grammaire anglaise - Present Perfect',
      description: 'Révision du present perfect et des temps',
      subject: 'Anglais',
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
      duration: 60,
      price: 35,
      status: 'SCHEDULED',
      clientIndex: 3, // Lucas Petit
    },
    {
      title: 'Physique - Électricité',
      description: 'Lois fondamentales de l\'électricité',
      subject: 'Physique-Chimie',
      date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // Dans 4 jours
      duration: 60,
      price: 35,
      status: 'SCHEDULED',
      clientIndex: 1, // Thomas Dubois
    },
    {
      title: 'Mathématiques - Géométrie',
      description: 'Théorème de Pythagore et trigonométrie',
      subject: 'Mathématiques',
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
      duration: 60,
      price: 30,
      status: 'SCHEDULED',
      clientIndex: 4, // Emma Rousseau
    },
    {
      title: 'Français - Dissertation',
      description: 'Méthodologie de la dissertation',
      subject: 'Français',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      duration: 90,
      price: 40,
      status: 'SCHEDULED',
      clientIndex: 2, // Marie Bernard
    },
  ];

  for (const courseData of coursesData) {
    const client = clients[courseData.clientIndex];

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        subject: courseData.subject,
        date: courseData.date,
        duration: courseData.duration,
        price: courseData.price,
        status: courseData.status,
        professorId: professor.id,
        clientId: client.id,
        location: client.address,
      },
    });

    console.log(`✅ Cours créé: ${course.title} - ${client.firstName} ${client.lastName}`);
  }

  // 4. Créer des factures et lier les cours complétés
  console.log('\n💰 Création des factures...');

  const invoicesData = [
    {
      clientIndex: 0, // Julie Martin
      status: 'PAID',
      daysFromNow: -15,
    },
    {
      clientIndex: 1, // Thomas Dubois
      status: 'SENT',
      daysFromNow: -5,
    },
    {
      clientIndex: 2, // Marie Bernard
      status: 'OVERDUE',
      daysFromNow: -20,
    },
  ];

  for (const invoiceData of invoicesData) {
    const client = clients[invoiceData.clientIndex];
    const issueDate = new Date(now.getTime() + invoiceData.daysFromNow * 24 * 60 * 60 * 1000);
    const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Récupérer les cours complétés de ce client qui n'ont pas encore de facture
    const completedCourses = await prisma.course.findMany({
      where: {
        professorId: professor.id,
        clientId: client.id,
        status: 'COMPLETED',
        invoiceId: null,
      },
    });

    if (completedCourses.length === 0) {
      console.log(`⚠️ Aucun cours complété sans facture pour ${client.firstName} ${client.lastName}`);
      continue;
    }

    // Calculer le montant total
    const amount = completedCourses.reduce((sum, course) => sum + course.price, 0);
    const taxRate = 0.20;
    const taxAmount = amount * taxRate;
    const totalAmount = amount + taxAmount;

    // Créer la facture
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `FAC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        status: invoiceData.status,
        issueDate,
        dueDate,
        amount,
        taxRate,
        taxAmount,
        totalAmount,
        professorId: professor.id,
        clientId: client.id,
        notes: 'Cours de soutien scolaire',
      },
    });

    // Lier les cours à la facture
    await prisma.course.updateMany({
      where: {
        id: { in: completedCourses.map(c => c.id) },
      },
      data: {
        invoiceId: invoice.id,
      },
    });

    console.log(`✅ Facture créée: ${invoice.invoiceNumber} - ${client.firstName} ${client.lastName} (${invoice.status}) - ${completedCourses.length} cours`);
  }

  // 5. Créer des messages
  console.log('\n💬 Création des messages...');

  const messagesData = [
    {
      clientIndex: 0,
      content: 'Bonjour Maxime, je voudrais savoir si vous êtes disponible pour un cours supplémentaire cette semaine ?',
      fromClient: true,
      daysAgo: 2,
    },
    {
      clientIndex: 0,
      content: 'Bonjour Julie, oui je suis disponible mercredi après-midi. Je vous propose 16h ?',
      fromClient: false,
      daysAgo: 1,
    },
    {
      clientIndex: 1,
      content: 'Merci pour le dernier cours, c\'était très clair ! À jeudi.',
      fromClient: true,
      daysAgo: 3,
    },
  ];

  for (const messageData of messagesData) {
    const client = clients[messageData.clientIndex];
    const createdAt = new Date(now.getTime() - messageData.daysAgo * 24 * 60 * 60 * 1000);

    await prisma.message.create({
      data: {
        content: messageData.content,
        senderId: messageData.fromClient ? client.id : professor.id,
        receiverId: messageData.fromClient ? professor.id : client.id,
        read: !messageData.fromClient,
        createdAt,
      },
    });

    console.log(`✅ Message créé: ${messageData.fromClient ? 'De' : 'À'} ${client.firstName}`);
  }

  console.log('\n✨ Seed terminé avec succès !');
  console.log('\n📋 Informations de connexion:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍🏫 Professeur:');
  console.log(`   Email: ${professorEmail}`);
  console.log(`   Password: password123`);
  console.log('\n👨‍🎓 Clients (tous avec password: password123):');
  clients.forEach(client => {
    console.log(`   - ${client.email} (${client.firstName} ${client.lastName})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
