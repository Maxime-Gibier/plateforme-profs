# Configuration Supabase - Guide complet

## Étape 1 : Créer un projet Supabase (2-3 minutes)

1. Allez sur **https://supabase.com**
2. Cliquez sur **"Start your project"**
3. Connectez-vous (GitHub, Google, ou Email)
4. Cliquez sur **"New project"**
5. Remplissez :
   - **Name** : `plateforme-profs`
   - **Database Password** : Créez un mot de passe fort (NOTEZ-LE BIEN !)
   - **Region** : Europe West (Paris) ou la plus proche de vous
   - **Pricing Plan** : Free (gratuit)
6. Cliquez sur **"Create new project"**
7. ⏳ Attendez 2-3 minutes que le projet soit créé...

## Étape 2 : Récupérer l'URL de connexion PostgreSQL

Une fois votre projet créé :

1. Dans le dashboard Supabase, cliquez sur l'icône **Settings** (engrenage) en bas à gauche
2. Dans le menu, cliquez sur **Database**
3. Scrollez vers le bas jusqu'à la section **"Connection string"**
4. Sélectionnez l'onglet **"URI"** (pas "Session mode")
5. Vous verrez une URL qui ressemble à :
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```
6. **Copiez cette URL**
7. **Remplacez** `[YOUR-PASSWORD]` par le mot de passe que vous avez créé à l'étape 1

## Étape 3 : Configurer le fichier .env

1. Ouvrez le fichier `.env` à la racine du projet
2. Remplacez `VOTRE_URL_SUPABASE_ICI` par l'URL complète que vous avez copiée

Exemple :
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MonMotDePasse123!@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
```

## Étape 4 : Générer le client Prisma et migrer le schéma

Une fois le `.env` configuré, exécutez ces commandes :

```bash
# 1. Générer le client Prisma
npm run db:generate

# 2. Pousser le schéma vers Supabase (crée toutes les tables)
npm run db:push
```

## Étape 5 : Vérifier que tout fonctionne

```bash
# Ouvrir Prisma Studio pour voir la base de données
npm run db:studio
```

Vous devriez voir toutes vos tables créées dans Supabase !

## Problèmes courants

### Erreur "Can't reach database server"
- Vérifiez que vous avez bien remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe
- Vérifiez qu'il n'y a pas d'espaces avant ou après l'URL
- Vérifiez que vous utilisez l'onglet "URI" et non "Session mode"

### Erreur "Invalid connection string"
- Le format doit être : `postgresql://postgres.xxxxx:PASSWORD@xxxxx.pooler.supabase.com:6543/postgres`
- Assurez-vous que les guillemets sont bien présents dans le .env

### Le projet Supabase est en "pause"
- Les projets gratuits se mettent en pause après 7 jours d'inactivité
- Allez dans votre dashboard Supabase et cliquez sur "Resume project"

## Voir vos données dans Supabase

Vous pouvez aussi voir vos tables directement dans Supabase :
1. Dans le dashboard Supabase, cliquez sur **Table Editor** (icône tableau)
2. Vous verrez toutes vos tables : User, Course, Invoice, Quote, Message, etc.

## Prochaines étapes

Une fois la base de données configurée :
1. Créez un compte sur http://localhost:3000/auth/signup
2. Connectez-vous et testez la plateforme !
3. Les données seront sauvegardées dans Supabase

## Limites du plan gratuit

- 500 MB de base de données
- 2 GB de bande passante par mois
- 50 000 utilisateurs actifs mensuels

C'est largement suffisant pour démarrer et tester votre plateforme !
