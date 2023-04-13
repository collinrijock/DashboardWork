import React, { FC } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

const SignIn: FC = () => {
  const { signIn } = useFirebaseAuth();

  return (
    <div className="h-full grid place-content-center">
      <div className="bg-primary max-w-lg w-full animate-fade-in-up p-10 rounded-lg">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-extrabold">Please log in to your Lula account</h2>
        </div>
        <div className="text-center mt-6">
          <button
            onClick={signIn}
            className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-lula"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
