# Plateforme Profs - Gestion de cours à domicile

Une plateforme complète inspirée d'Unipros pour la gestion de cours à domicile, permettant aux professeurs de gérer leurs clients, cours, factures et de communiquer avec leurs élèves.

## Fonctionnalités

### Pour les Professeurs
- Dashboard avec statistiques (clients, cours, revenus)
- Gestion des clients
- Planning des cours
- Création et gestion de devis
- Création et gestion de factures (PDF)
- Messagerie avec les clients
- Accès à l'API de prestations tierces

### Pour les Clients
- Dashboard avec cours à venir
- Consultation des factures
- Historique des cours
- Messagerie avec le professeur
- Paiement en ligne (Stripe)

## Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom components inspirés de shadcn/ui
- **PDF**: jsPDF
- **Real-time**: Socket.io (pour la messagerie)

## Installation

### 1. Cloner le projet

Le projet est déjà créé dans ce dossier.

### 2. Installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 3. Configurer la base de données

Créez un fichier `.env` à la racine du projet en copiant `.env.example`:

\`\`\`bash
cp .env.example .env
\`\`\`

Puis modifiez les variables d'environnement:

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/plateforme_profs?schema=public"
NEXTAUTH_SECRET="votre-secret-super-securise-ici"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 4. Initialiser la base de données

\`\`\`bash
# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio pour voir la DB
npx prisma studio
\`\`\`

### 5. Lancer le serveur de développement

\`\`\`bash
npm run dev
\`\`\`

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du projet

\`\`\`
/app
  /api               # Routes API
    /auth           # Authentification
    /professor      # APIs professeur
    /client         # APIs client
  /auth             # Pages d'authentification
  /professor        # Interface professeur
  /client           # Interface client
/components
  /ui               # Composants UI réutilisables
  /providers        # Providers (Session, etc.)
/lib                # Utilitaires et configuration
/prisma             # Schéma et migrations Prisma
/types              # Types TypeScript
\`\`\`

## Modèles de données

- **User**: Utilisateurs (professeurs et clients)
- **Course**: Cours programmés
- **Invoice**: Factures
- **Quote**: Devis
- **Message**: Messages entre professeurs et clients

## Routes principales

### Publiques
- `/` - Page d'accueil
- `/auth/signin` - Connexion
- `/auth/signup` - Inscription

### Professeur (protégées)
- `/professor/dashboard` - Dashboard professeur
- `/professor/clients` - Gestion des clients
- `/professor/courses` - Gestion des cours
- `/professor/invoices` - Gestion des factures
- `/professor/quotes` - Gestion des devis
- `/professor/messages` - Messagerie

### Client (protégées)
- `/client/dashboard` - Dashboard client
- `/client/courses` - Mes cours
- `/client/invoices` - Mes factures
- `/client/messages` - Messagerie

## Prochaines étapes

1. **Compléter les interfaces de gestion** (clients, factures, devis)
2. **Implémenter la messagerie en temps réel** avec Socket.io
3. **Ajouter la génération de PDF** pour les factures et devis
4. **Intégrer Stripe** pour les paiements
5. **Intégrer l'API de prestations tierces**
6. **Ajouter des tests**
7. **Optimiser les performances**

## Développement

### Commandes utiles

\`\`\`bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Linter
npm run lint

# Prisma Studio (interface DB)
npx prisma studio

# Reset DB
npx prisma db push --force-reset
\`\`\`

## Contribuer

Ce projet est en cours de développement. N'hésitez pas à contribuer !

## Licence

MIT
