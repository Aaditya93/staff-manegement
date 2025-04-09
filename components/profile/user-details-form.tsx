import { useState, useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { EmailManagement } from "./email-management";

type UserDetailsFormProps = {
  initialName: string;
  initialCountry: string;
  initialEmails: string[];
  onNameChange: (name: string) => void;
  onCountryChange: (country: string) => void;
};

export function UserDetailsForm({
  initialName,
  initialCountry,
  initialEmails,
  onNameChange,
  onCountryChange,
}: UserDetailsFormProps) {
  const id = useId();

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor={`${id}-full-name`}>Full name</Label>
        <Input
          id={`${id}-full-name`}
          placeholder="Full name"
          value={initialName}
          onChange={(e) => onNameChange(e.target.value)}
          type="text"
          required
        />
      </div>

      <EmailManagement initialEmails={initialEmails} />

      <div className="space-y-2">
        <Label htmlFor={`${id}-country`}>Country</Label>
        <Select value={initialCountry} onValueChange={onCountryChange}>
          <SelectTrigger id={`${id}-country`}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="in">India</SelectItem>
            <SelectItem value="jp">Japan</SelectItem>
            <SelectItem value="br">Brazil</SelectItem>
            <SelectItem value="mx">Mexico</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}
