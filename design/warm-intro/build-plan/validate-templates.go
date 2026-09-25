package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"strings"
	texttemplate "text/template"
)

type Draft struct {
	Subject string `json:"subject"`
	Body    string `json:"body"`
}
type DraftFixture struct {
	Katelyn Draft `json:"request-katelyn"`
	Ethan   Draft `json:"request-ethan"`
	Final   Draft `json:"final"`
}

func must(err error) {
	if err != nil {
		panic(err)
	}
}
func main() {
	raw, err := os.ReadFile("fixtures/expected-drafts.json")
	must(err)
	var drafts DraftFixture
	must(json.Unmarshal(raw, &drafts))
	cases := []struct {
		name, output, recipient, counterpart string
		draft                                Draft
	}{
		{"first-request", "first-request", "Katelyn", "Ethan", drafts.Katelyn},
		{"second-request", "second-request", "Ethan", "Katelyn", drafts.Ethan},
		{"final-introduction", "final-introduction", "Katelyn", "Ethan", drafts.Final},
		{"neutral-closure", "neutral-closure", "Katelyn", "Ethan", Draft{Subject: "An update on your introduction"}},
		{"first-request", "reverse-first-request", "Ethan", "Katelyn", drafts.Ethan},
		{"second-request", "reverse-second-request", "Katelyn", "Ethan", drafts.Katelyn},
	}
	must(os.MkdirAll("rendered", 0755))
	var results []string
	for _, c := range cases {
		data := map[string]any{
			"SignatureLines": []string{}, "Subject": c.draft.Subject, "Preheader": "A personal introduction from Mark.",
			"SenderName": "Mark Pederson", "SenderFirstName": "Mark", "RecipientFirstName": c.recipient, "CounterpartFirstName": c.counterpart,
			"FirstPersonName": "Katelyn Gallanty", "SecondPersonName": "Ethan Jacks", "Body": c.draft.Body,
			"Paragraphs": strings.Split(c.draft.Body, "\n\n"), "InvitationURL": "https://app.example.invalid/i/warm-intro#token=fixture-" + strings.ToLower(c.recipient),
			"ExpiresAtLabel": "October 9, 2026 at 12:00 UTC", "Footer": "Sent with care by Mark via Orbiter.",
		}
		if c.name == "final-introduction" {
			data["Preheader"] = "You are both on this introduction from Mark."
		}
		if c.name == "neutral-closure" {
			data["Preheader"] = "This introduction will not be going ahead this time."
		}
		h, err := template.New(c.name + ".html.tmpl").Option("missingkey=error").ParseFiles(filepath.Join("emails", c.name+".html.tmpl"))
		must(err)
		var out bytes.Buffer
		must(h.Execute(&out, data))
		html := out.String()
		if strings.Contains(html, "ZgotmplZ") {
			panic("unsafe fixture URL")
		}
		request := strings.Contains(c.name, "request")
		if request && strings.Count(html, ">Review introduction</a>") != 1 {
			panic("expected one CTA")
		}
		if !request && strings.Contains(html, "#token=") {
			panic("capability in non-request")
		}
		if strings.Contains(html, "has agreed to the introduction") != (c.name == "second-request") {
			panic("incorrect acceptance banner")
		}
		must(os.WriteFile(filepath.Join("rendered", c.output+".html"), out.Bytes(), 0644))
		plain, err := texttemplate.New(c.name + ".txt.tmpl").Option("missingkey=error").ParseFiles(filepath.Join("emails", c.name+".txt.tmpl"))
		must(err)
		var txt bytes.Buffer
		must(plain.Execute(&txt, data))
		if request && (!strings.Contains(txt.String(), data["InvitationURL"].(string)) || !strings.Contains(html, data["InvitationURL"].(string))) {
			panic("link mismatch")
		}
		for _, realEmail := range []string{"ethan@mediabridgecap.com", "katelyn@orbiter.io"} {
			if strings.Contains(html, realEmail) || strings.Contains(txt.String(), realEmail) {
				panic("real recipient address in public body")
			}
		}
		must(os.WriteFile(filepath.Join("rendered", c.output+".txt"), txt.Bytes(), 0644))
		hostile := map[string]any{}
		for k, v := range data {
			hostile[k] = v
		}
		hostile["Paragraphs"] = []string{"<script>alert('unsafe')</script> & facts"}
		hostile["SenderName"] = "<script>alert('sender')</script>"
		hostile["RecipientFirstName"] = "<script>alert('recipient')</script>"
		hostile["SignatureLines"] = []string{"<script>alert('signature')</script>"}
		out.Reset()
		must(h.Execute(&out, hostile))
		if strings.Contains(out.String(), "<script>") {
			panic("unescaped user content")
		}
		incomplete := map[string]any{}
		for k, v := range data {
			incomplete[k] = v
		}
		delete(incomplete, "Footer")
		out.Reset()
		if h.Execute(&out, incomplete) == nil {
			panic("missing HTML field accepted")
		}
		txt.Reset()
		if plain.Execute(&txt, incomplete) == nil {
			panic("missing text field accepted")
		}
		results = append(results, c.output+": actual names/rationale, HTML/text, stage banner, escaping, capability match and missing fields passed")
		fmt.Println(results[len(results)-1])
	}
	result := map[string]any{"status": "passed", "fixture": "User-selected Ethan Jacks / Katelyn Gallanty; authored order-neutral expectations, not model output", "rendered_cases": len(cases), "checks": results, "not_tested": []string{"No provider sends, real client inbox rendering, API consent or model calls."}}
	report, err := json.MarshalIndent(result, "", "  ")
	must(err)
	must(os.WriteFile("email-verification.json", append(report, '\n'), 0644))
}
