import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { logoutUser } from "../api/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUser.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) setTimeout(() => setLoading(false), 500); // simulate loading
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        You are not logged in.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile Card */}
      <Card className="overflow-hidden shadow-lg border-none bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-6 p-6">
          {loading ? (
            <Skeleton className="h-24 w-24 rounded-full" />
          ) : (
            <img
              src={user.profileImage || "/default.png"}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover ring-2 ring-blue-500/30"
            />
          )}
          <div className="text-center sm:text-left flex-1">
            <CardTitle className="text-2xl font-semibold">
              {loading ? <Skeleton className="h-6 w-40" /> : user.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {loading ? <Skeleton className="h-4 w-60" /> : user.email}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-6 pb-6">
          {/* Prediction Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={18} /> My Predictions
            </h3>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : user.myPredictions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven’t made any predictions yet.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {user.myPredictions.map((p, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-medium"
                  >
                    {p.slug} ({p.timeframe})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Logout Button */}
          <div className="flex justify-end pt-4">
            <Button
              variant="destructive"
              className="gap-2 hover:scale-105 transition-transform"
              onClick={() => logoutUser(dispatch)}
            >
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
