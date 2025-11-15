import React, { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AIChatSession } from "@/Services/AiModel";
import { updateThisResume } from "@/Services/resumeAPI";

const promptTemplate =
  "Job Title: {jobTitle}. Based on this job title, provide a list of summaries for two experience levels: Mid Level and Fresher level, each with 3–4 lines. Respond strictly in JSON array format with fields 'summary' and 'experience_level'.";

function Summary({ resumeInfo, enanbledNext, enanbledPrev }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(resumeInfo?.summary || "");
  const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState(null);
  const { resume_id } = useParams();

  const handleInputChange = (e) => {
    enanbledNext(false);
    enanbledPrev(false);
    dispatch(
      addResumeData({
        ...resumeInfo,
        [e.target.name]: e.target.value,
      })
    );
    setSummary(e.target.value);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      data: { summary },
    };

    try {
      if (resume_id) {
        await updateThisResume(resume_id, data);
        toast.success("Resume Updated Successfully");
      }
    } catch (error) {
      console.error("Error updating resume:", error);
      toast.error(`Error updating resume: ${error.message}`);
    } finally {
      enanbledNext(true);
      enanbledPrev(true);
      setLoading(false);
    }
  };

  const setSummery = (summary) => {
    dispatch(
      addResumeData({
        ...resumeInfo,
        summary,
      })
    );
    setSummary(summary);
  };

  const GenerateSummeryFromAI = async () => {
    if (!resumeInfo?.jobTitle) {
      toast.warning("Please add a Job Title first.");
      return;
    }

    setLoading(true);
    const PROMPT = promptTemplate.replace("{jobTitle}", resumeInfo?.jobTitle);

    try {
      console.log("Generating Summary From AI for:", resumeInfo?.jobTitle);

      const result = await AIChatSession.sendMessage(PROMPT);

      // ✅ Gemini 2.0 Flash returns response text as string
      const text = result.response.text();
      console.log("Raw AI Response:", text);

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        console.error("AI response parse error:", parseError);
        toast.error("AI response is not valid JSON");
        return;
      }

      setAiGenerateSummeryList(parsed);
      toast.success("AI Summaries Generated Successfully!");
    } catch (error) {
      console.error("Gemini API Error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Summary</h2>
        <p>Add a short professional summary for your job title.</p>

        <form className="mt-7" onSubmit={onSave}>
          <div className="flex justify-between items-end">
            <label>Add Summary</label>
            <Button
              variant="outline"
              onClick={GenerateSummeryFromAI}
              type="button"
              size="sm"
              className="border-primary text-primary flex gap-2"
              disabled={loading}
            >
              <Sparkles className="h-4 w-4" /> Generate from AI
            </Button>
          </div>

          <Textarea
            name="summary"
            className="mt-5"
            required
            value={summary}
            onChange={handleInputChange}
          />

          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>

      {aiGeneratedSummeryList && (
        <div className="my-5">
          <h2 className="font-bold text-lg">AI Suggestions</h2>
          {aiGeneratedSummeryList.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                enanbledNext(false);
                enanbledPrev(false);
                setSummery(item?.summary);
              }}
              className="p-5 shadow-lg my-4 rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <h2 className="font-bold my-1 text-primary">
                Level: {item?.experience_level}
              </h2>
              <p>{item?.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Summary;
