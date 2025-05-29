import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faGlobe,
  faLock,
  faArrowRight,
  faUnlockAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../firebase.js";
import { signOut } from "firebase/auth";
import { doc, setDoc, collection, onSnapshot } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function SessionManager() {
  const [activeTab, setActiveTab] = useState("public");
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate("/");
        return;
      }

      const unsubscribeSnapshot = onSnapshot(
        collection(db, "sessions"),
        (snapshot) => {
          const sessionList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSessions(sessionList);
        },
        (err) => {
          console.error("Firestore listener error:", err);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const createSession = async () => {
    if (!newSessionName || !user) return;
    try {
      setError(null);
      const sessionId = `${user.uid}-${Date.now()}`;
      const sessionData = {
        name: newSessionName,
        creatorId: user.uid,
        creatorUsername: user.displayName || "Anonymous",
        participants: [
          { uid: user.uid, username: user.displayName || "Anonymous" },
        ],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "sessions", sessionId), sessionData);
      setNewSessionName("");
      navigate(`/session/${sessionId}`);
    } catch (err) {
      setError("Failed to create session: " + err.message);
    }
  };

  const joinSession = async (sessionId) => {
    if (!user) {
      setError("You must be logged in to join a session.");
      return;
    }
    try {
      setError(null);
      const sessionRef = doc(db, "sessions", sessionId);
      const currentSession = sessions.find((s) => s.id === sessionId);
      if (!currentSession) throw new Error("Session not found");

      if (!currentSession.participants.some((p) => p.uid === user.uid)) {
        const updatedParticipants = [
          ...currentSession.participants,
          { uid: user.uid, username: user.displayName || "Anonymous" },
        ];
        await setDoc(
          sessionRef,
          { participants: updatedParticipants },
          { merge: true }
        );
      }
      navigate(`/session/${sessionId}`);
    } catch (err) {
      setError("Failed to join session: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      setError("Error signing out: " + error.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <header className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <svg
            width="215.39307556152343"
            height="50.626132567226996"
            viewBox="0 0 383.8999938964844 90.23211137541728"
            class="looka-1j8o68f"
          >
            <defs id="SvgjsDefs4865"></defs>
            <g
              id="SvgjsG4866"
              featurekey="symbolFeature-0"
              transform="matrix(0.6898787855261039,0,0,0.6898787855261039,-13.310095387583845,-2.90760899534669)"
              fill="#000000"
            >
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M96.63 57.12q11.83 7.36 23.98 14.42c4.75 2.76 4.29 5.89-.18 8.46q-3.3 1.89-6.48 3.64-.8.44-.02.91l6.97 4.19a4.64 4.63-74.5 0 1 2.24 3.97v17.42a4.2 4.2 0 0 1-2.05 3.61q-10.37 6.18-21.01 12.58c-2.5 1.51-3.82 1.71-6.39.13q-13.16-8.08-21.94-13.31a.63.63 0 0 0-.64 0l-23.23 13.88a4.18 4.15 45 0 1-4.27-.01l-21.55-12.96a3.87 3.86 15.6 0 1-1.87-3.31q.01-11.33-.01-17.49-.02-3.31 2.55-4.76 3.07-1.73 6.62-4.05a.31.31 0 0 0-.02-.53q-6.07-3.54-8.62-5.19-1.57-1.02-1.4-3.41c.15-1.92 1.7-2.78 3.31-3.74q9.73-5.76 23.85-14.27.46-.28.16-.73c-.49-.73-1.02-1.43-1.03-2.51q-.02-17.99.01-25.14a4.73 4.72 74.6 0 1 2.28-4.03q9.96-5.99 20.84-12.4 2.97-1.75 5.04-.52 15.95 9.45 20.69 12.07 3.17 1.74 3.2 4.7.1 12.03-.04 25.02-.01.82-1.17 2.58-.31.48.18.78m-25.56-12.7q.53-2.61 2.69-3.93 5.89-3.61 17.45-11.03a.31.31 0 0 0-.01-.53L72.17 17.49a.79.79 0 0 0-.82 0L52.33 28.85a1.95 1.95 0 0 0-.94 1.67v22.29a2.23 2.22 15.7 0 0 1.07 1.9l18.03 10.84a.36.35-74.5 0 0 .54-.31l.02-20.56a1.77 1.64-42.8 0 1 .02-.26m26.42 28.32c2.06 1.44 2.23 4.4-.02 5.75Q79.09 89.54 73.35 92.96a3.74 3.72 44.9 0 1-3.83-.01Q59.11 86.71 47.76 79.7c-1.31-.81-2.87-1.56-3.41-2.97-.87-2.26.63-3.76 2.48-4.89q5.13-3.1 11.23-6.78a.16.16 0 0 0 0-.27l-6.3-3.78q-.24-.15-.48 0L27.46 75.24a.47.47 0 0 0-.01.81l43.38 26.09a1.14 1.12 44.6 0 0 1.15 0l43.89-26.22a.3.3 0 0 0 0-.52L91.29 60.62q-.17-.11-.34 0l-6.4 3.82a.18.17 44 0 0 .01.3q8.83 5.14 12.93 8m-32 11.01q0 .18.08.23 2.9 1.66 5.73 3.44.01.01.14.02.06.01.12.01t.12-.01q.13-.01.14-.02 2.83-1.78 5.73-3.44.07-.05.07-.23t-.07-.23q-2.9-1.66-5.73-3.44-.01-.01-.14-.02-.06-.01-.12-.01t-.12.01q-.13.01-.14.02-2.83 1.78-5.73 3.44-.08.05-.08.23M45.6 121.56a.35.35 0 0 0 .36 0l22.62-13.51a.35.35 0 0 0 0-.6l-19.1-11.48a.35.35 0 0 0-.36 0l-22.62 13.5a.35.35 0 0 0 0 .6zm70.54-11.46a.34.34 0 0 0 0-.58L93.65 95.99a.34.34 0 0 0-.34 0l-19.13 11.43a.34.34 0 0 0 0 .58l22.49 13.53a.34.34 0 0 0 .34 0z"
              ></path>
            </g>
            <g
              id="SvgjsG4867"
              featurekey="textGroupContainer"
              transform="matrix(1,0,0,1,92,4)"
              fill="#000000"
            >
              <rect
                xmlns="http://www.w3.org/2000/svg"
                y="0"
                x="0"
                height="1"
                width="1"
                opacity="0"
              ></rect>
              <rect
                xmlns="http://www.w3.org/2000/svg"
                y="80.88"
                x="0"
                width="28"
                height="2"
              ></rect>
              <rect
                xmlns="http://www.w3.org/2000/svg"
                y="80.88"
                x="263.9"
                width="28"
                height="2"
              ></rect>
            </g>
            <g
              id="SvgjsG4868"
              featurekey="nameFeature-0"
              transform="matrix(2.189502365161019,0,0,2.189502365161019,96.37259705740317,-26.274026293860054)"
              fill="#000000"
            >
              <path d="M4.92 40 l-3.72 -3.72 l0 -20.56 l3.72 -3.72 l8.8 0 l3.72 3.72 l0 5.24 l-5.04 0 l0 -3.16 l-0.76 -0.76 l-4.64 0 l-0.76 0.76 l0 16.4 l0.76 0.76 l4.64 0 l0.76 -0.76 l0 -3.16 l5.04 0 l0 5.24 l-3.72 3.72 l-8.8 0 z M24.137999999999998 40 l-3.72 -3.72 l0 -20.56 l3.72 -3.72 l9.08 0 l3.72 3.72 l0 20.56 l-3.72 3.72 l-9.08 0 z M26.218 34.96 l4.92 0 l0.76 -0.76 l0 -16.4 l-0.76 -0.76 l-4.92 0 l-0.76 0.76 l0 16.4 z M39.916000000000004 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l6.72 0 l0 4.48 l-0.84 0.56 l0 17.92 l2.8 0 l0.56 -0.84 l4.48 0 l0 5.88 l-13.72 0 z M56.614000000000004 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l6.72 0 l0 4.48 l-0.84 0.56 l0 17.92 l2.8 0 l0.56 -0.84 l4.48 0 l0 5.88 l-13.72 0 z M72.512 40 l0 -4.48 l0.84 -0.56 l3.64 -17.92 l-0.84 -0.56 l0 -4.48 l10.64 0 l0 4.48 l-0.84 0.56 l3.64 17.92 l0.84 0.56 l0 4.48 l-4.96 0 l-1.24 -6.16 l-5.52 0 l-1.24 6.16 l-4.96 0 z M79.752 28.8 l3.44 0 l-1.72 -8.56 z M92.61 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l12.52 0 l3.72 3.72 l0 8.24 l-2.04 2.04 l2.04 2.04 l0 8.24 l-3.72 3.72 l-12.52 0 z M98.49 34.96 l4.56 0 l0.76 -0.76 l0 -4.08 l-1.6 -1.6 l-3.72 0 l0 6.44 z M98.49 23.48 l3.72 0 l1.6 -1.6 l0 -4.08 l-0.76 -0.76 l-4.56 0 l0 6.44 z M111.828 40 l0 -4.48 l1.16 -0.76 l3.16 -8.76 l-3.16 -8.76 l-1.16 -0.76 l0 -4.48 l4.6 0 l3.52 9.68 l3.52 -9.68 l4.6 0 l0 4.48 l-1.16 0.76 l-3.16 8.76 l3.16 8.76 l1.16 0.76 l0 4.48 l-4.6 0 l-3.52 -9.68 l-3.52 9.68 l-4.6 0 z"></path>
            </g>
            <g
              id="SvgjsG4869"
              featurekey="sloganFeature-0"
              transform="matrix(0.7101623092992436,0,0,0.7101623092992436,126.28983769070075,75.94364511632456)"
              fill="#000000"
            >
              <path d="M1.26 20 c-0.16 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.1 -0.26 0.26 -0.26 l4.88 0 c1.52 0 2.72 0.38 3.56 1.16 c1.24 1.12 1.66 3.24 1.06 4.8 c-0.22 0.56 -0.6 1.08 -1.08 1.46 c-0.28 0.22 -0.58 0.38 -0.88 0.54 c0.86 1.36 2.16 4.12 2.16 4.12 c0.02 0.04 0.06 0.1 0.06 0.16 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.96 0 c-0.08 0 -0.18 -0.06 -0.22 -0.14 l-1.74 -3.82 c-0.62 0.04 -1.1 0.02 -1.74 0.02 l0 3.68 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.58 0 z M4.1 13.280000000000001 c0 0 2.52 0.28 3.4 -0.3 c0.34 -0.22 0.54 -0.76 0.54 -1.16 c-0.02 -0.44 -0.24 -0.9 -0.6 -1.18 c-0.38 -0.32 -1.32 -0.42 -1.8 -0.42 l-1.54 0.04 l0 3.02 z M14.1455 20 l0 -11.98 c0 -0.5 0.1 -0.6 0.26 -0.6 l8.76 0 c0.14 0 0.26 0.1 0.26 0.24 l0 2.26 c0 0.14 -0.12 0.26 -0.26 0.26 l-5.92 0 l0 2.08 l3.74 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-3.74 0 l0 2.14 l5.9 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-8.74 0 z M26.791 20 c-0.08 0 -0.16 -0.04 -0.2 -0.12 c-0.06 -0.06 -0.06 -0.16 -0.04 -0.24 l4.66 -11.98 c0.04 -0.1 0.14 -0.16 0.24 -0.16 l2.68 0 c0.1 0 0.2 0.06 0.24 0.16 l4.58 11.98 c0.02 0.08 0.02 0.16 -0.04 0.24 c-0.04 0.08 -0.12 0.12 -0.2 0.12 l-2.78 0 c-0.1 0 -0.2 -0.06 -0.24 -0.16 l-0.74 -1.84 l-4.5 0.02 l-0.74 1.82 c-0.04 0.1 -0.14 0.16 -0.24 0.16 l-2.68 0 z M31.271 15.5 l2.88 0 l-1.44 -4.24 z M42.1365 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 9.36 l4.5 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.36 c0 0.14 -0.12 0.26 -0.26 0.26 l-7.36 0 z M62.6075 20 c-0.14 0 -0.24 -0.12 -0.24 -0.26 l0 -9.44 l-2.74 0 c-0.14 0 -0.26 -0.1 -0.26 -0.24 l0 -2.3 c0 -0.14 0.12 -0.26 0.26 -0.26 l8.58 0 c0.16 0 0.26 0.12 0.26 0.26 l0 2.3 c0 0.14 -0.1 0.24 -0.26 0.24 l-2.74 0 l0 9.44 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 z M71.833 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 z M78.0585 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.88 0 c0.1 0 0.2 0.06 0.24 0.14 l3 7.4 l2.98 -7.4 c0.04 -0.08 0.14 -0.14 0.24 -0.14 l2.88 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.34 0 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -6.44 l-2.44 6.2 c-0.04 0.08 -0.14 0.14 -0.22 0.14 l-1.68 0 c-0.1 0 -0.2 -0.06 -0.24 -0.14 l-2.46 -6.2 l0 6.44 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.32 0 z M93.64399999999999 20 l0 -11.98 c0 -0.5 0.1 -0.6 0.26 -0.6 l8.76 0 c0.14 0 0.26 0.1 0.26 0.24 l0 2.26 c0 0.14 -0.12 0.26 -0.26 0.26 l-5.92 0 l0 2.08 l3.74 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-3.74 0 l0 2.14 l5.9 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-8.74 0 c-0.16 0 -0.26 -0.12 -0.26 0.08 z M118.83499999999998 20 c-1.18 0 -2.26 -0.28 -3.22 -0.84 c-0.96 -0.58 -1.72 -1.36 -2.26 -2.34 s-0.82 -2.08 -0.82 -3.3 c0 -1.18 0.28 -2.28 0.84 -3.26 c0.56 -0.96 1.34 -1.74 2.3 -2.3 c0.98 -0.56 2.08 -0.84 3.24 -0.84 c0.88 0 1.74 0.2 2.58 0.56 c0.84 0.38 1.56 0.88 2.16 1.52 c0.08 0.1 0.08 0.24 0 0.34 l-1.9 1.56 c-0.06 0.06 -0.12 0.1 -0.2 0.1 s-0.16 -0.04 -0.2 -0.1 c-1.02 -1.24 -2.66 -1.5 -4.04 -0.64 c-1.2 0.74 -1.64 2.1 -1.58 3.46 c0.06 1.38 1.06 2.56 2.38 2.96 c1.2 0.36 2.38 0.08 3.24 -0.84 c0.06 -0.04 0.12 -0.08 0.2 -0.06 c0.08 0 0.14 0.02 0.18 0.08 l1.94 1.36 c0.08 0.1 0.08 0.24 0 0.34 c-0.64 0.68 -1.4 1.24 -2.24 1.64 c-0.86 0.4 -1.74 0.6 -2.6 0.6 z M133.2805 20 c-1.2 0 -2.3 -0.28 -3.26 -0.84 c-0.98 -0.56 -1.76 -1.36 -2.34 -2.32 c-0.56 -0.98 -0.84 -2.1 -0.84 -3.3 c0 -1.18 0.28 -2.28 0.84 -3.26 c0.58 -0.98 1.34 -1.76 2.32 -2.32 s2.08 -0.84 3.28 -0.84 c1.18 0 2.28 0.28 3.26 0.84 s1.76 1.34 2.32 2.32 c0.58 0.98 0.86 2.08 0.86 3.26 c0 1.2 -0.28 2.3 -0.86 3.28 c-0.56 0.98 -1.34 1.76 -2.32 2.34 c-0.98 0.56 -2.08 0.84 -3.26 0.84 z M133.32049999999998 17.12 c0.58 0 1.12 -0.16 1.6 -0.46 c0.5 -0.32 0.9 -0.74 1.18 -1.3 c0.3 -0.54 0.44 -1.16 0.44 -1.82 c0 -0.64 -0.14 -1.26 -0.44 -1.8 c-0.28 -0.54 -0.68 -0.96 -1.18 -1.28 c-0.48 -0.3 -1.02 -0.46 -1.6 -0.46 c-0.6 0 -1.14 0.16 -1.64 0.46 c-0.52 0.32 -0.92 0.74 -1.22 1.28 c-0.3 0.56 -0.44 1.16 -0.44 1.8 c0 0.66 0.14 1.28 0.44 1.82 c0.32 0.54 0.72 0.98 1.22 1.28 c0.5 0.32 1.04 0.48 1.64 0.48 z M143.08599999999996 20 c-0.16 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.1 -0.26 0.26 -0.26 l4.54 0 c1.2 0 2.3 0.26 3.26 0.8 c0.96 0.52 1.7 1.26 2.24 2.22 c0.52 0.94 0.8 2.02 0.8 3.22 c0 1.22 -0.28 2.3 -0.82 3.24 c-0.54 0.96 -1.3 1.7 -2.28 2.22 c-0.96 0.54 -2.08 0.8 -3.3 0.8 l-4.44 0 z M145.92599999999996 17.2 l1.76 0 c0.58 0 1.12 -0.14 1.58 -0.42 c0.46 -0.3 0.84 -0.7 1.1 -1.22 s0.4 -1.12 0.4 -1.8 c0 -0.66 -0.14 -1.28 -0.42 -1.8 c-0.28 -0.54 -0.66 -0.94 -1.14 -1.24 c-0.48 -0.28 -1.04 -0.44 -1.64 -0.44 l-1.64 0 l0 6.92 z M157.29149999999996 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 z M163.51699999999997 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.36 0 c0.08 0 0.16 0.04 0.22 0.1 l4.6 7.1 l0 -6.94 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.46 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.36 0 c-0.08 0 -0.16 -0.04 -0.22 -0.1 l-4.58 -7.06 l0 6.9 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.48 0 z M183.16249999999997 20 c-1.18 0 -2.28 -0.28 -3.24 -0.84 c-0.98 -0.58 -1.74 -1.36 -2.3 -2.32 c-0.56 -0.98 -0.84 -2.1 -0.84 -3.3 s0.28 -2.3 0.86 -3.26 c0.56 -0.98 1.36 -1.76 2.34 -2.32 c1 -0.56 2.12 -0.84 3.34 -0.84 c0.88 0 1.74 0.16 2.6 0.5 c0.84 0.32 1.58 0.78 2.18 1.36 c0.1 0.08 0.12 0.22 0.04 0.34 l-1.46 1.92 c-0.06 0.06 -0.12 0.1 -0.2 0.12 c-0.06 0 -0.14 -0.04 -0.2 -0.08 c-0.4 -0.4 -0.86 -0.72 -1.4 -0.94 c-0.52 -0.22 -1.04 -0.34 -1.56 -0.34 c-0.62 0 -1.2 0.16 -1.7 0.46 c-0.52 0.32 -0.92 0.74 -1.22 1.28 s-0.44 1.14 -0.44 1.8 s0.14 1.28 0.44 1.82 s0.72 0.98 1.22 1.3 c0.52 0.3 1.1 0.46 1.7 0.46 c0.32 0 0.66 -0.06 1.04 -0.16 c0.32 -0.1 0.66 -0.24 0.96 -0.4 l0 -0.92 l-1.38 0 c-0.08 0 -0.14 -0.02 -0.18 -0.08 c-0.06 -0.04 -0.08 -0.1 -0.08 -0.18 l0.02 -2.24 c0 -0.14 0.12 -0.26 0.26 -0.26 l3.88 0 c0.14 0 0.26 0.12 0.26 0.26 l0 5.02 c0 0.08 -0.04 0.16 -0.12 0.22 c-0.62 0.48 -1.38 0.88 -2.26 1.16 c-0.88 0.3 -1.74 0.46 -2.56 0.46 z M203.0135 20 c-1.08 0 -1.86 -0.22 -2.68 -0.66 c-0.8 -0.44 -1.44 -1.06 -1.88 -1.88 c-0.44 -0.8 -0.66 -1.76 -0.66 -2.86 l0 -7.04 c0 -0.14 0.12 -0.24 0.26 -0.24 l2.6 0 c0.14 0 0.24 0.1 0.24 0.24 l0 7.04 c0 0.8 0.22 1.42 0.64 1.86 s0.8 0.66 1.5 0.66 s1.06 -0.22 1.46 -0.64 c0.4 -0.44 0.6 -1.08 0.6 -1.88 l0 -7.04 c0 -0.14 0.12 -0.24 0.26 -0.24 l2.6 0 c0.14 0 0.26 0.1 0.26 0.24 l0 7.04 c0 1.1 -0.22 2.06 -0.66 2.86 c-0.42 0.82 -1.06 1.44 -1.86 1.88 s-1.6 0.66 -2.68 0.66 z M211.57899999999998 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.36 0 c0.08 0 0.16 0.04 0.22 0.1 l4.6 7.1 l0 -6.94 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.46 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.36 0 c-0.08 0 -0.16 -0.04 -0.22 -0.1 l-4.58 -7.06 l0 6.9 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.48 0 z M225.10449999999997 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 9.36 l4.5 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.36 c0 0.14 -0.12 0.26 -0.26 0.26 l-7.36 0 z M235.82999999999998 20 l0 -11.98 c0 -0.5 0.1 -0.6 0.26 -0.6 l8.76 0 c0.14 0 0.26 0.1 0.26 0.24 l0 2.26 c0 0.14 -0.12 0.26 -0.26 0.26 l-5.92 0 l0 2.08 l3.74 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-3.74 0 l0 2.14 l5.9 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-8.74 0 c-0.16 0 -0.26 -0.12 -0.26 0.08 z M248.47549999999998 20 c-0.08 0 -0.16 -0.04 -0.2 -0.12 c-0.06 -0.06 -0.06 -0.16 -0.04 -0.24 l4.66 -11.98 c0.04 -0.1 0.14 -0.16 0.24 -0.16 l2.68 0 c0.1 0 0.2 0.06 0.24 0.16 l4.58 11.98 c0.02 0.08 0.02 0.16 -0.04 0.24 c-0.04 0.08 -0.12 0.12 -0.2 0.12 l-2.78 0 c-0.1 0 -0.2 -0.06 -0.24 -0.16 l-0.74 -1.84 l-4.5 0.02 l-0.74 1.82 c-0.04 0.1 -0.14 0.16 -0.24 0.16 l-2.68 0 z M252.9555 15.5 l2.88 0 l-1.44 -4.24 z M268.70099999999996 20.12 c-0.96 0 -1.92 -0.18 -2.84 -0.54 c-0.92 -0.34 -1.74 -0.84 -2.42 -1.44 c-0.08 -0.08 -0.1 -0.2 -0.06 -0.3 l0.7 -2.38 c0.04 -0.08 0.1 -0.14 0.18 -0.14 c0.08 -0.02 0.16 0 0.22 0.06 c1.06 1 2.26 1.9 3.76 1.98 c0.4 0.02 0.84 0.04 1.22 -0.08 c1.18 -0.38 0.68 -1.58 -0.2 -1.94 c-0.3 -0.12 -0.72 -0.26 -1.26 -0.42 c-0.8 -0.22 -1.46 -0.46 -1.96 -0.7 c-0.54 -0.24 -1 -0.62 -1.4 -1.12 c-0.38 -0.52 -0.58 -1.2 -0.58 -2.02 c0 -0.78 0.2 -1.46 0.6 -2.04 s0.96 -1.04 1.66 -1.34 s1.52 -0.46 2.44 -0.46 c0.82 0 1.62 0.12 2.42 0.38 c0.78 0.24 1.48 0.58 2.1 0.98 c0.1 0.08 0.14 0.2 0.08 0.32 l-0.66 2.24 c-0.02 0.08 -0.08 0.12 -0.16 0.14 c-0.06 0.02 -0.14 0.02 -0.2 -0.02 c-0.9 -0.56 -1.8 -1.24 -2.86 -1.38 c-0.7 -0.1 -1.76 -0.06 -2 0.78 c-0.3 1.08 1.28 1.36 2 1.58 c0.8 0.24 1.46 0.48 1.98 0.72 c0.54 0.26 1.02 0.66 1.4 1.16 c0.4 0.52 0.6 1.22 0.6 2.06 c0 0.82 -0.22 1.52 -0.64 2.12 c-0.4 0.6 -0.98 1.04 -1.7 1.36 c-0.72 0.28 -1.52 0.44 -2.42 0.44 z M276.82649999999995 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 4.92 l4.52 0 l0 -4.92 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -4.3 l-4.52 0 l0 4.3 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 z M290.43199999999996 20 l0 -11.98 c0 -0.5 0.1 -0.6 0.26 -0.6 l8.76 0 c0.14 0 0.26 0.1 0.26 0.24 l0 2.26 c0 0.14 -0.12 0.26 -0.26 0.26 l-5.92 0 l0 2.08 l3.74 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-3.74 0 l0 2.14 l5.9 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-8.74 0 c-0.16 0 -0.26 -0.12 -0.26 0.08 z M303.07749999999993 20 c-0.16 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.1 -0.26 0.26 -0.26 l4.54 0 c1.2 0 2.3 0.26 3.26 0.8 c0.96 0.52 1.7 1.26 2.24 2.22 c0.52 0.94 0.8 2.02 0.8 3.22 c0 1.22 -0.28 2.3 -0.82 3.24 c-0.54 0.96 -1.3 1.7 -2.28 2.22 c-0.96 0.54 -2.08 0.8 -3.3 0.8 l-4.44 0 z M305.91749999999996 17.2 l1.76 0 c0.58 0 1.12 -0.14 1.58 -0.42 c0.46 -0.3 0.84 -0.7 1.1 -1.22 s0.4 -1.12 0.4 -1.8 c0 -0.66 -0.14 -1.28 -0.42 -1.8 c-0.28 -0.54 -0.66 -0.94 -1.14 -1.24 c-0.48 -0.28 -1.04 -0.44 -1.64 -0.44 l-1.64 0 l0 6.92 z"></path>
            </g>
          </svg>
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border-2 font-bold border-black text-black rounded-xl hover:bg-black hover:text-white transition-all"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
            <span>Logout</span>
          </button>
        </header>

        <div className="container mx-auto px-6 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                className="flex-1 px-5 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                placeholder="Name your session"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
              <button
                onClick={createSession}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all"
              >
                <FontAwesomeIcon icon={faBolt} className="text-sm" />
                <span>Launch</span>
              </button>
            </div>
            {error && <p className="text-red-500 text-base">{error}</p>}
          </div>
        </div>
      </div>

      <div className="pt-40 px-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <div className="flex gap-3 mb-8 bg-gray-100 p-1 rounded-lg">
              <button
                className={`flex-1 py-4 font-semibold rounded-md text-base transition-all ${
                  activeTab === "public"
                    ? "bg-indigo-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("public")}
              >
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                Public
              </button>
              <button
                className={`flex-1 py-4 font-semibold rounded-md text-base transition-all ${
                  activeTab === "private"
                    ? "bg-indigo-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("private")}
              >
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Private
              </button>
            </div>

            {activeTab === "public" ? (
              <div className="max-h-[70vh] overflow-y-auto pr-4">
                {sessions.length ? (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white p-6 rounded-md border border-gray-200 hover:-translate-y-0.5 hover:shadow-md transition-all mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {session.name}
                          </h3>
                          <p className="text-base text-gray-500">
                            by {session.creatorUsername} •{" "}
                            {session.participants.length} participants
                          </p>
                        </div>
                        <button
                          onClick={() => joinSession(session.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all"
                        >
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-sm"
                          />
                          <span>
                            {session.participants.some(
                              (p) => p.uid === user?.uid
                            )
                              ? "Rejoin"
                              : "Join"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-base text-gray-500">
                    No sessions yet. Create one!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-base text-gray-700 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter Room ID"
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-5 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter Password"
                  />
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all">
                  <FontAwesomeIcon icon={faUnlockAlt} />
                  <span>Access Room</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionManager;
