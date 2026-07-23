const PENDING_CLAIM_KEY = "pendingAnonymousClaim";

export interface PendingAnonymousClaim {
  linkId: string;
  claimToken: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CLAIM_TOKEN_RE = /^[a-f0-9]{64}$/;

function isValidClaim(value: unknown): value is PendingAnonymousClaim {
  if (!value || typeof value !== "object") return false;
  const claim = value as Record<string, unknown>;
  return (
    typeof claim.linkId === "string" &&
    UUID_RE.test(claim.linkId) &&
    typeof claim.claimToken === "string" &&
    CLAIM_TOKEN_RE.test(claim.claimToken)
  );
}

export function savePendingAnonymousClaim(claim: PendingAnonymousClaim) {
  if (!isValidClaim(claim)) return;
  sessionStorage.setItem(PENDING_CLAIM_KEY, JSON.stringify(claim));
}

export function getPendingAnonymousClaim(): PendingAnonymousClaim | null {
  const raw = sessionStorage.getItem(PENDING_CLAIM_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isValidClaim(parsed)) return parsed;
  } catch {
    // Invalid local state should be discarded.
  }

  clearPendingAnonymousClaim();
  return null;
}

export function clearPendingAnonymousClaim() {
  sessionStorage.removeItem(PENDING_CLAIM_KEY);
  sessionStorage.removeItem("pendingClaimId");
}