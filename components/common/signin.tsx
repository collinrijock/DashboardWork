import { useAuthContext } from "@/hooks/auth";
import React, { FC } from "react";

const SignIn: FC = () => {
  const { login } = useAuthContext();

  return (
    <div className="h-screen grid place-content-center">
      <div className="bg-primary max-w-lg w-full animate-fade-in-up p-10 rounded-lg shadow-2xl">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-extrabold">Please log in to your Lula account</h2>
        </div>
        <div className="text-center mt-6">
          <button
            onClick={login}
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
