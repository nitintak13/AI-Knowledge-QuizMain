import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import QuizPage from "@/pages/quiz";
import ThemeToggle from "@/components/ThemeToggle";

function Router() {
  return (
    <Switch>
      <Route path="/" component={QuizPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
