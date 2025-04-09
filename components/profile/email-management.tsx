import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MutipleEmailSignIn } from "@/actions/auth/sign-out";

export function EmailManagement({
  initialEmails = [],
}: {
  initialEmails: string[];
}) {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  // Update email in the list
  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // Add a new email to the account
  const handleAddEmail = async () => {
    if (!newEmailInput || !newEmailInput.includes("@")) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address",
      });
      return;
    }

    setIsAddingEmail(true);

    try {
      await MutipleEmailSignIn(newEmailInput);

      // Update the UI
      setEmails([...emails, newEmailInput]);
      setNewEmailInput("");

      toast.success("Email added", {
        description: "The email has been linked to your account",
      });
    } catch (error) {
      console.error("Error adding email:", error);
      toast.error("Failed to add email. Please try again.");
    } finally {
      setIsAddingEmail(false);
    }
  };

  // Remove an email from the list
  const removeEmail = (index: number) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    setEmails(newEmails);
  };

  return (
    <div className="space-y-2">
      <Label>Email addresses</Label>
      <div className="space-y-2">
        {emails.map((email, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => updateEmail(index, e.target.value)}
              required={index === 0}
            />
            {index > 0 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => removeEmail(index)}
              >
                <Trash size={16} className="text-destructive" />
              </Button>
            )}
          </div>
        ))}

        {/* Add input for new email */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="New email address"
            type="email"
            value={newEmailInput}
            onChange={(e) => setNewEmailInput(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleAddEmail}
            disabled={isAddingEmail}
          >
            {isAddingEmail ? (
              <Loader2 size={16} className="animate-spin mr-1" />
            ) : (
              <>
                <Plus size={16} className="mr-1" /> Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
