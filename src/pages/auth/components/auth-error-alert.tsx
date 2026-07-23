import { IconAlertCircle } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthErrorAlertProps {
  message: string | null;
  onSwitchToSignIn?: (email: string) => void;
  existingEmail?: string;
}

export function AuthErrorAlert({ message, onSwitchToSignIn, existingEmail }: AuthErrorAlertProps) {
  if (!message) return null;

  const isExistingEmail = message.includes("already exists");

  return (
    <Alert variant="destructive">
      <IconAlertCircle className="size-4" />
      <AlertDescription>
        {isExistingEmail && onSwitchToSignIn && existingEmail ? (
          <>
            An account with this email already exists.{" "}
            <button
              type="button"
              className="underline font-medium"
              onClick={() => onSwitchToSignIn(existingEmail)}
            >
              Sign in instead &rarr;
            </button>
          </>
        ) : (
          message
        )}
      </AlertDescription>
    </Alert>
  );
}
