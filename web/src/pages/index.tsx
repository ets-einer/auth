import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data, isLoading, isError } = useQuery(["me"], () =>
    fetch(`${import.meta.env.VITE_AUTH_API_URL}/me`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
      },
      credentials: "include",
    }).then((res) => res.json())
  );

  if (isLoading) return <p>Loading...</p>;

  if (isError) return <p>Error!</p>;

  return (
    <div>
      <h1>Home</h1>
      <p>{JSON.stringify(data, null, 2)}</p>
    </div>
  );
}
