import { useQuery } from "@tanstack/react-query";

export default function PersonalGreeting() {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = (settings as any)?.userName || "Friend";

  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-light text-white mb-2">
        {getGreeting()}, <span className="font-medium">{userName}</span>
      </h1>
    </div>
  );
}
