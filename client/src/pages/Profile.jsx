import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { logoutUser } from "../api/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Pencil, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUser.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setTimeout(() => setLoading(false), 500); // Simulate loading
    }
  }, [user]);

  if (!user) {
    return <div className="p-6 text-center text-muted-foreground">User not logged in.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-6">
          {loading ? (
            <Skeleton className="h-20 w-20 rounded-full" />
          ) : (
            <img
              src={user.profileImage || "/default.png"}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover"
            />
          )}
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl font-semibold">
              {loading ? <Skeleton className="h-6 w-40" /> : user.username}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading ? <Skeleton className="h-4 w-60" /> : user.email}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Prediction Links Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Prediction References</h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : user.myPredictions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven't made any predictions yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {user.myPredictions.map((p, index) => (
                  <li key={index}>
                    <Link
                      to={`/prediction/${p.slug}/${p.timeframe}`}
                      className="flex items-center justify-between px-4 py-2 bg-muted hover:bg-muted/70 rounded-md transition"
                    >
                      <span className="capitalize">{p.slug} ({p.timeframe})</span>
                      <ExternalLink size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <Link to="/settings">
              <Button variant="outline" className="gap-2">
                <Pencil size={16} /> Edit Profile
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="gap-2"
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
