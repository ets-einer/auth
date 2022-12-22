import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function SignIn() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const { mutate } = useMutation(
    ["signIn"],
    () =>
      fetch(`${import.meta.env.VITE_AUTH_API_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({ email, password: pwd }),
        credentials: "include",
      }).then((res) => res.json()),
    {
      onSuccess: (res) => {
        // alert(JSON.stringify(res, null, 2));
        const callBackUrl = searchParams.get("callbackUrl");
        if (callBackUrl) {
          window.location.href = callBackUrl;
        }
      },
      onError: (err) => alert(JSON.stringify(err, null, 2)),
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate();
    // navigate("/");
  };
  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="pwd">Password</label>
        <input
          type="password"
          id="pwd"
          name="pwd"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignIn;
