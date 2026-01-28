import React, { useState } from "react";
import { Send, Chrome } from "lucide-react";
import { Input } from "./ui/Input";

const AccountTab: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Send magic link to:", email);
  };

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full organizer-px-1">
      {/* Connect with Google */}
      <div className="organizer-mb-6">
        <h3 className="organizer-text-text-primary organizer-font-bold organizer-text-sm organizer-mb-2">
          Connect with Google
        </h3>
        <button className="organizer-w-full organizer-bg-surface organizer-text-text-primary organizer-font-medium organizer-py-3 organizer-px-4 organizer-rounded-xl organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 hover:organizer-bg-surface-hover organizer-transition-colors organizer-border organizer-border-border-default">
          <Chrome size={18} />
          <span>Sign in with Google</span>
        </button>
      </div>

      {/* Login with Magic Links */}
      <div className="organizer-mb-6">
        <h3 className="organizer-text-text-primary organizer-font-bold organizer-text-sm organizer-mb-2">
          Login with Magic Links
        </h3>
        <p className="organizer-text-text-secondary organizer-text-xs organizer-mb-3 organizer-leading-relaxed">
          Enter your email to receive a{" "}
          <span className="organizer-text-primary organizer-font-medium">
            Magic Link
          </span>{" "}
          for secure login. If you don't have an account, this will automatically
          create one for you.
        </p>

        <form onSubmit={handleLogin}>
          <div className="organizer-mb-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="emirhankeskindev@gmail.com"
            />
          </div>

          <button
            type="submit"
            className="organizer-w-full organizer-bg-surface organizer-text-text-primary organizer-font-medium organizer-py-2.5 organizer-px-4 organizer-rounded-lg organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 hover:organizer-bg-surface-hover organizer-transition-colors organizer-border organizer-border-border-default"
          >
            <span>Send Magic Link</span>
            <Send size={14} className="organizer-text-primary" />
          </button>
        </form>
      </div>

      {/* Disclaimer */}
      <div className="organizer-mt-auto">
        <p className="organizer-text-text-secondary organizer-text-xs organizer-leading-relaxed">
          If you are not receiving our emails, please whitelist:{" "}
          <span className="organizer-text-primary organizer-font-medium">
            emirhankeskindev@gmail.com
          </span>{" "}
          with your email provider, or try a different email (Gmail accounts are
          the most reliable).
        </p>
      </div>
    </div>
  );
};

export default AccountTab;
