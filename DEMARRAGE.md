# Guide de démarrage rapide

## Étapes pour lancer le projet

### 1. Installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 2. Configurer PostgreSQL

Assurez-vous d'avoir PostgreSQL installé et en cours d'exécution.

**Option A : PostgreSQL local**
\`\`\`bash
# Sur macOS avec Homebrew
brew install postgresql@14
brew services start postgresql@14

# Créer la base de données
createdb plateforme_profs
\`\`\`

**Option B : Docker**
\`\`\`bash
docker run --name postgres-plateforme -e POSTGRES_PASSWORD=password -e POSTGRES_DB=plateforme_profs -p 5432:5432 -d postgres:14
\`\`\`

### 3. Créer le fichier .env

\`\`\`bash
cp .env.example .env
\`\`\`

Puis éditez `.env` avec vos informations :

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/plateforme_profs?schema=public"
NEXTAUTH_SECRET="generer-un-secret-avec-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

Pour générer un secret sécurisé :
\`\`\`bash
openssl rand -base64 32
\`\`\`

### 4. Initialiser la base de données

\`\`\`bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push
\`\`\`

### 5. (Optionnel) Seed de données de test

Vous pouvez créer des utilisateurs de test manuellement ou via Prisma Studio :

\`\`\`bash
npx prisma studio
\`\`\`

Ou créez un compte via l'interface de signup sur http://localhost:3000/auth/signup

### 6. Lancer le serveur

\`\`\`bash
npm run dev
\`\`\`

Le projet sera accessible sur **http://localhost:3000**

## Test de l'application

### Créer un compte Professeur
1. Allez sur http://localhost:3000
2. Cliquez sur "Espace Professeur"
3. Puis sur "Créer un compte"
4. Remplissez le formulaire en sélectionnant "Professeur"

### Créer un compte Client
1. Allez sur http://localhost:3000
2. Cliquez sur "Espace Client"
3. Puis sur "Créer un compte"
4. Remplissez le formulaire en sélectionnant "Client"

## Fonctionnalités actuellement disponibles

### Professeur
- Dashboard avec statistiques
- API pour gérer les cours
- API pour les statistiques

### Client
- Dashboard avec cours à venir
- Consultation des cours
- Consultation des factures

## Prochaines fonctionnalités à implémenter

1. Pages de gestion complètes pour :
   - Clients (CRUD)
   - Cours (CRUD complet)
   - Factures (CRUD + génération PDF)
   - Devis (CRUD + génération PDF)

2. Système de messagerie en temps réel

3. Intégration de paiements (Stripe)

4. API de prestations tierces

## Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est bien démarré
- Vérifiez la chaîne de connexion dans `.env`
- Essayez : `npx prisma db push --force-reset` (⚠️ cela supprime toutes les données)

### Erreur NextAuth
- Vérifiez que `NEXTAUTH_SECRET` est bien défini dans `.env`
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL locale

### Port 3000 déjà utilisé
\`\`\`bash
# Lancer sur un autre port
PORT=3001 npm run dev
\`\`\`

## Commandes utiles

\`\`\`bash
# Voir la base de données
npx prisma studio

# Réinitialiser la DB
npx prisma db push --force-reset

# Générer le client Prisma après modification du schéma
npx prisma generate

# Build de production
npm run build
npm start
\`\`\`
