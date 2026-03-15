# Cooked

Application de nutrition (type MyFitnessPal). Monorepo Turborepo + pnpm.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Mobile | Expo SDK 55, Expo Router, NativeWind v4, React Native 0.83 |
| API | NestJS 11, Prisma 7, Better Auth, Pino |
| Monorepo | Turborepo, pnpm 10 |
| Linting | Biome 2.4 |

## Prérequis

- **Node.js** >= 22
- **pnpm** >= 10
- **Docker** (pour PostgreSQL et Redis en local)
- **JDK 17+** (pour les builds Android)

## Installation

```bash
# Cloner le repo
git clone <repo-url> && cd cooked

# Installer les dépendances
pnpm install
```

## Lancer le projet en local

### API (backend)

```bash
pnpm dev:api
```

### Mobile (Expo)

```bash
pnpm dev:mobile
```

> Le flag `--tunnel` est activé par défaut dans le script (obligatoire sous WSL2).

---

## Build Android

### Prérequis Android

#### 1. Android Studio (Windows)

Android Studio doit etre installe **cote Windows** (pas dans WSL2 : l'emulateur a besoin du GPU Windows).

1. Telecharger et installer [Android Studio](https://developer.android.com/studio)
2. Au premier lancement, laisser telecharger le SDK Android
3. Dans **Settings > Languages & Frameworks > Android SDK** :
   - **SDK Platforms** : installer Android 15 (API 35) et/ou Android 16 (API 36)
   - **SDK Tools** : cocher Android SDK Build-Tools, Command-line Tools, Emulator, Platform-Tools

> Chemin SDK par defaut : `C:\Users\<USER>\AppData\Local\Android\Sdk`

#### 2. JDK dans WSL2

```bash
sudo apt install openjdk-17-jdk -y
```

#### 3. Variables d'environnement (WSL2)

Ajouter dans `~/.bashrc` ou `~/.zshrc` :

```bash
export ANDROID_HOME=/mnt/c/Users/<TON_USER>/AppData/Local/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Puis recharger :

```bash
source ~/.bashrc
```

#### 4. Wrappers WSL2 pour les binaires Windows

WSL2 ne peut pas executer directement les `.exe` du SDK Android. Il faut creer des scripts wrappers qui redirigent vers les `.exe` correspondants.

**Wrapper `adb` :**

```bash
cat > /mnt/c/Users/<TON_USER>/AppData/Local/Android/Sdk/platform-tools/adb << 'EOF'
#!/bin/bash
exec /mnt/c/Users/<TON_USER>/AppData/Local/Android/Sdk/platform-tools/adb.exe "$@"
EOF
chmod +x /mnt/c/Users/<TON_USER>/AppData/Local/Android/Sdk/platform-tools/adb
```

**Wrappers build-tools** (repeter pour chaque version dans `build-tools/` qui n'a que des `.exe`) :

```bash
cd /mnt/c/Users/<TON_USER>/AppData/Local/Android/Sdk/build-tools/<VERSION>
for f in *.exe; do
  name="${f%.exe}"
  if [ ! -f "$name" ] || [ ! -x "$name" ]; then
    printf '#!/bin/bash\nexec "%s/%s" "$@"\n' "$(pwd)" "$f" > "$name"
    chmod +x "$name"
  fi
done
```

#### 5. Symlink react-native-worklets (pnpm)

pnpm cree des hardlinks pour les fichiers sources mais les artefacts de build Gradle sont generes uniquement sous le chemin `.pnpm/`. Le build natif de `react-native-reanimated` attend `libworklets.so` au chemin hoisted. Il faut creer un symlink :

```bash
# Depuis la racine du projet
ln -s node_modules/.pnpm/react-native-worklets@<VERSION>/node_modules/react-native-worklets/android/build \
      node_modules/react-native-worklets/android/build
```

> Ce symlink saute apres chaque `pnpm install`. A recreer si le build natif echoue avec `libworklets.so missing`.

---

### Lancer sur l'emulateur Android Studio

1. **Creer un emulateur (AVD)** dans Android Studio :
   - **Tools > Device Manager > Create Virtual Device**
   - Choisir un device (ex: Pixel 7)
   - Selectionner une image systeme **x86_64** avec Google APIs
   - Terminer la creation

2. **Lancer l'emulateur** depuis Android Studio (le demarrer avant le build)

3. **Verifier que ADB detecte l'emulateur** :

```bash
adb devices
# Doit afficher :
# emulator-5554   device
```

4. **Lancer le build + install** :

```bash
cd apps/mobile
npx expo run:android
```

> Le premier build est long (telechargement Gradle, NDK, compilation C++). Les builds suivants sont caches et beaucoup plus rapides.

---

### Lancer sur un smartphone physique

#### Via USB

1. **Activer le debogage USB** sur le telephone :
   - Parametres > A propos du telephone > Taper 7 fois sur "Numero de build"
   - Parametres > Options pour les developpeurs > Activer "Debogage USB"

2. **Brancher le telephone en USB** et accepter l'invite de debogage

3. **Verifier la connexion** :

```bash
adb devices
# Doit afficher :
# <SERIAL>   device
```

4. **Lancer le build** :

```bash
cd apps/mobile
npx expo run:android
```

#### Via Wi-Fi (sans cable)

1. **Brancher le telephone en USB** d'abord, puis :

```bash
# Activer le mode TCP/IP sur le telephone
adb tcpip 5555

# Recuperer l'IP du telephone (Parametres > Wi-Fi > Details)
adb connect <IP_DU_TELEPHONE>:5555
```

2. **Debrancher le cable USB**

3. **Verifier** :

```bash
adb devices
# Doit afficher :
# <IP>:5555   device
```

4. **Lancer le build** comme d'habitude :

```bash
cd apps/mobile
npx expo run:android
```

#### Via Expo Go (dev rapide, sans build natif)

Pour tester rapidement sans recompiler le code natif :

```bash
cd apps/mobile
pnpm dev
```

Scanner le QR code affiche dans le terminal avec l'app **Expo Go** (disponible sur le Play Store).

> Expo Go ne supporte pas les modules natifs custom. Pour un test complet, utiliser `npx expo run:android`.

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Lance l'API + le mobile en parallele (Turborepo) |
| `pnpm dev:api` | Lance uniquement l'API |
| `pnpm dev:mobile` | Lance uniquement le mobile (Expo + tunnel) |
| `pnpm build` | Build de production |
| `pnpm check` | Lint + format avec Biome |
| `pnpm typecheck` | Verification des types TypeScript |
| `pnpm test` | Lance les tests |

## Structure du projet

```
cooked/
  apps/
    api/          # Backend NestJS
    mobile/       # App mobile Expo
  packages/
    tsconfig/     # Config TypeScript partagee
  docs/           # Documentation de contexte
```
