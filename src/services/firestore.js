// src/services/firestore.js
// Firestore CRUD operations for MamaCycle UG

import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/* -------------------- USERS -------------------- */

export async function createUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/* -------------------- CYCLES -------------------- */

export async function addCycle(userId, cycleData) {
  const ref = await addDoc(collection(db, "cycles"), {
    userId,
    ...cycleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCycles(userId, max = 12) {
  const q = query(
    collection(db, "cycles"),
    where("userId", "==", userId),
    orderBy("periodStart", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateCycle(cycleId, data) {
  const ref = doc(db, "cycles", cycleId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCycle(cycleId) {
  await deleteDoc(doc(db, "cycles", cycleId));
}

/* -------------------- SYMPTOMS (daily logs) -------------------- */

export async function addSymptomLog(userId, logData) {
  const ref = await addDoc(collection(db, "symptoms"), {
    userId,
    ...logData,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getSymptomLogs(userId, max = 30) {
  const q = query(
    collection(db, "symptoms"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* -------------------- ARTICLES -------------------- */

export async function getArticlesByCategory(category, max = 20) {
  const q = query(
    collection(db, "articles"),
    where("category", "==", category),
    orderBy("publishedAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getArticleById(articleId) {
  const ref = doc(db, "articles", articleId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/* -------------------- SYNC QUEUE (offline support) -------------------- */

export async function queueSync(userId, action, collectionName, documentId, data) {
  const ref = await addDoc(collection(db, "syncQueue"), {
    userId,
    action,
    collection: collectionName,
    documentId,
    data,
    status: "pending",
    attempts: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}