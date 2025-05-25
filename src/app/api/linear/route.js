import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { issues } = await req.json();
    if (!issues) {
      return NextResponse.json({ error: "No issues provided" }, { status: 400 });
    }
    let issuesArr;
    try {
      issuesArr = typeof issues === 'string' ? JSON.parse(issues) : issues;
    } catch (e) {
      return NextResponse.json({ error: "Invalid issues JSON" }, { status: 400 });
    }
    const linearKey = process.env.LINEAR_API_KEY;
    if (!linearKey) {
      return NextResponse.json({ error: "Missing Linear API key" }, { status: 500 });
    }
    // You may want to set your teamId here, or pass it from the frontend
    const TEAM_ID = process.env.LINEAR_TEAM_ID;
    // Optionally, map priority string to Linear's priority number
    const priorityMap = { none: 0, urgent: 1, high: 2, medium: 3, low: 4 };
    const results = [];
    for (const issue of issuesArr) {
      const mutation = {
        query: `mutation CreateIssue($input: IssueCreateInput!) {\n  issueCreate(input: $input) {\n    success\n    issue { id title }\n  }\n}`,
        variables: {
          input: {
            teamId: TEAM_ID,
            title: issue.title,
            description: issue.description,
            priority: priorityMap[issue.priority?.toLowerCase?.()] ?? 3,
            // Optionally add stateId if you want to set a specific state
          }
        }
      };
      const res = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": linearKey.startsWith('Bearer ') ? linearKey : `Bearer ${linearKey}`,
        },
        body: JSON.stringify(mutation),
      });
      const data = await res.json();
      if (!data.data?.issueCreate?.success) {
        results.push({ success: false, error: data.errors?.[0]?.message || "Unknown error", issue: issue.title });
      } else {
        results.push({ success: true, id: data.data.issueCreate.issue.id, title: data.data.issueCreate.issue.title });
      }
    }
    const allSuccess = results.every(r => r.success);
    return NextResponse.json({ success: allSuccess, results });
  } catch (err) {
    return NextResponse.json({ error: "Failed to import issues to Linear" }, { status: 500 });
  }
} 