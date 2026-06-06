const LOCAL_AUTH_KEY = "ei-harold-auth";
const FIREBASE_ENV = window.EI_HAROLD_FIREBASE_ENV || {};
const FIREBASE_ENABLED = Boolean(FIREBASE_ENV.enabled);
const FIREBASE_CONFIG = FIREBASE_ENV.config || {};
const FIRESTORE_COLLECTION = FIREBASE_ENV.collection || "users";
const FIRESTORE_DOC_PATH = FIREBASE_ENV.documentPath || ["app", "finance"];

let firebaseServicesPromise = null;
let firebaseSdkPromise = null;

function hasRequiredConfig(config) {
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId
  );
}

function getFinanceDocRef(docFn, db, userId) {
  return docFn(db, FIRESTORE_COLLECTION, userId, ...FIRESTORE_DOC_PATH);
}

async function getFirebaseServices() {
  if (!FIREBASE_ENABLED) return null;

  if (!hasRequiredConfig(FIREBASE_CONFIG)) {
    throw new Error("Firebase ativo, mas firebase-env.js está incompleto.");
  }

  if (!firebaseServicesPromise) {
    firebaseServicesPromise = (async () => {
      const {
        initializeApp,
        browserLocalPersistence,
        createUserWithEmailAndPassword,
        deleteUser,
        getAuth,
        onAuthStateChanged,
        setPersistence,
        signInWithEmailAndPassword,
        signOut,
        doc,
        getDoc,
        getFirestore,
        serverTimestamp,
        setDoc
      } = await getFirebaseSdk();

      const app = initializeApp(FIREBASE_CONFIG);
      const auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      const db = getFirestore(app);
      return {
        app,
        auth,
        db,
        createUserWithEmailAndPassword,
        deleteUser,
        doc,
        getDoc,
        onAuthStateChanged,
        serverTimestamp,
        setDoc,
        signInWithEmailAndPassword,
        signOut
      };
    })();
  }

  return firebaseServicesPromise;
}

async function getFirebaseSdk() {
  if (!firebaseSdkPromise) {
    firebaseSdkPromise = Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
    ]).then(([app, auth, firestore]) => ({ ...app, ...auth, ...firestore }));
  }

  return firebaseSdkPromise;
}

function waitForAuthUser(auth) {
  return new Promise((resolve, reject) => {
    getFirebaseSdk().then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        user => {
          unsubscribe();
          resolve(user);
        },
        error => {
          unsubscribe();
          reject(error);
        }
      );
    }).catch(reject);
  });
}

window.EI_HAROLD_FIREBASE = {
  FIREBASE_ENABLED,

  async init() {
    return getFirebaseServices();
  },

  async login(email, password) {
    if (!FIREBASE_ENABLED) {
      sessionStorage.setItem(LOCAL_AUTH_KEY, "ok");
      return { uid: "local-dev-user", email: email || "local@dev" };
    }

    const { auth, signInWithEmailAndPassword } = await getFirebaseServices();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  async register(email, password, masterKey) {
    if (!FIREBASE_ENABLED) {
      sessionStorage.setItem(LOCAL_AUTH_KEY, "ok");
      return { uid: "local-dev-user", email: email || "local@dev" };
    }

    const { auth, createUserWithEmailAndPassword, deleteUser, db, doc, serverTimestamp, setDoc } = await getFirebaseServices();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    const viewId = crypto.randomUUID();
    const masterKeyHash = await hashText(masterKey);
    const ref = getFinanceDocRef(doc, db, user.uid);

    try {
      await setDoc(ref, {
        views: [{ id: viewId, name: "Custo de Vida 2026.1", items: [] }],
        activeViewId: viewId,
        registration: {
          masterKeyHash
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await setDoc(ref, {
        views: [{ id: viewId, name: "Custo de Vida 2026.1", items: [] }],
        activeViewId: viewId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      await deleteUser(user).catch(() => {});
      throw error;
    }

    return user;
  },

  async getCurrentUser() {
    if (!FIREBASE_ENABLED) {
      const isLoggedIn = sessionStorage.getItem(LOCAL_AUTH_KEY) === "ok";
      return isLoggedIn ? { uid: "local-dev-user" } : null;
    }

    const { auth } = await getFirebaseServices();
    return waitForAuthUser(auth);
  },

  async loadData(userId) {
    if (!FIREBASE_ENABLED || !userId) return null;

    const { db, doc, getDoc } = await getFirebaseServices();
    const snap = await getDoc(getFinanceDocRef(doc, db, userId));
    return snap.exists() ? snap.data() : null;
  },

  async saveData(userId, data) {
    if (!FIREBASE_ENABLED || !userId) return false;

    const { db, doc, serverTimestamp, setDoc } = await getFirebaseServices();
    await setDoc(
      getFinanceDocRef(doc, db, userId),
      {
        ...data,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return true;
  },

  async logout() {
    if (!FIREBASE_ENABLED) {
      sessionStorage.removeItem(LOCAL_AUTH_KEY);
      return true;
    }

    const { auth, signOut } = await getFirebaseServices();
    await signOut(auth);
    return true;
  }
};

async function hashText(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}
