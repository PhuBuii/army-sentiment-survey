import { validateTokenAndGetQuestions } from "@/app/actions/survey-actions";
import SurveyForm from "@/components/survey/SurveyForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const data = await validateTokenAndGetQuestions(token);

  if (data.error || !data.soldier || !data.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md shadow-lg border-red-100">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-xl text-red-700">Không thể truy cập khảo sát</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-slate-600">
            {data.error || "Đã xảy ra lỗi không xác định."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-gradient-to-br dark:from-[#0c1109] dark:via-[#1a2315] dark:to-[#0a0f08] selection:bg-emerald-500 dark:selection:bg-[#a3e635] selection:text-white dark:selection:text-black transition-colors duration-300 relative">
      <div className="absolute top-4 right-4 z-50">
         <ThemeToggle />
      </div>
      <div className="w-full max-w-3xl z-10">
        <SurveyForm soldier={data.soldier} questions={data.questions} token={token} />
      </div>
    </div>
  );
}
