"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

import { api } from "@/convex/_generated/api";

export default function AuthUserSync() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const upsertUser = useMutation(api.users.upsertFromClerk);
  const syncedClerkUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoaded || !userLoaded || !isSignedIn || !user) {
      if (!isSignedIn) {
        syncedClerkUserIdRef.current = null;
      }
      return;
    }

    if (syncedClerkUserIdRef.current === user.id) {
      return;
    }

    syncedClerkUserIdRef.current = user.id;

    const primaryEmail =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress;

    void upsertUser({
      clerkUserId: user.id,
      email: primaryEmail,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      fullName: user.fullName ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
    }).catch(() => {
      syncedClerkUserIdRef.current = null;
    });
  }, [authLoaded, isSignedIn, upsertUser, user, userLoaded]);

  return null;
}
