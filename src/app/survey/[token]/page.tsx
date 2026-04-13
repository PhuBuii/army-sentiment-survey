import { validateTokenAndGetQuestions } from "@/app/actions/survey-actions";
import SurveyForm from "@/components/survey/SurveyForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0c1109] via-[#1a2315] to-[#0a0f08] selection:bg-[#a3e635] selection:text-black">
      <div className="w-full max-w-3xl">
        <SurveyForm soldier={data.soldier} questions={data.questions} />
      </div>
    </div>
  );
}
