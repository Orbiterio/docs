package main

import (
 "bytes"
 "fmt"
 "html/template"
 "os"
 "path/filepath"
 "strings"
 texttemplate "text/template"
)

func main() {
 names := []string{"first-request", "second-request", "final-introduction", "neutral-closure"}
 data := map[string]any{
  "SignatureLines":[]string{}, "Subject":"Avery, meet Sarah?", "Preheader":"A personal introduction from Mark.",
  "SenderName":"Mark Pederson", "SenderFirstName":"Mark", "RecipientFirstName":"Avery",
  "CounterpartFirstName":"Sarah", "FirstPersonName":"Avery Stone", "SecondPersonName":"Sarah Chen",
  "Body":"Hi Avery,\n\nI’d love to introduce you to Sarah Chen. Your work on creative tools feels like a useful reason to connect.\n\nWould you be open to an introduction?\n\nMark",
  "InvitationURL":"https://app.example.com/i/warm-intro#token=fixture-only",
  "ExpiresAtLabel":"October 9, 2026 at 12:00 UTC", "Footer":"Sent with care by Mark via Orbiter.",
 }
 data["Paragraphs"] = strings.Split(data["Body"].(string),"\n\n")
 if err:=os.MkdirAll("rendered",0755);err!=nil{panic(err)}
 for _, name := range names {
  data["RecipientFirstName"]="Avery";data["CounterpartFirstName"]="Sarah"
  data["Subject"]="Avery, meet Sarah?";data["Preheader"]="A personal introduction from Mark."
  data["Body"]="Hi Avery,\n\nI’d love to introduce you to Sarah Chen. Your work on creative tools feels like a useful reason to connect.\n\nWould you be open to an introduction?\n\nMark"
  if name=="second-request" {
   data["RecipientFirstName"]="Sarah";data["CounterpartFirstName"]="Avery"
   data["Subject"]="Sarah, meet Avery?"
   data["Body"]="Hi Sarah,\n\nI’d love to introduce you to Avery Stone, the founder of Fieldwork. Your experience supporting creative software founders made me think this could be a useful conversation.\n\nWould you be open to an introduction?\n\nMark"
  }
  if name=="final-introduction" {
   data["Subject"]="Introducing Avery Stone and Sarah Chen"
   data["Preheader"]="You are both on this introduction from Mark."
   data["Body"]="Avery, meet Sarah. Sarah, meet Avery.\n\nThank you both for being open to connecting. Avery is building Fieldwork for creative teams, and Sarah supports creative software founders.\n\nI thought you would have a useful conversation about Fieldwork’s next chapter. I’ll leave it to you to find a time.\n\nOver to you both!\nMark"
  }
  if name=="neutral-closure" {data["Subject"]="An update on your introduction";data["Preheader"]="This introduction will not be going ahead this time."}
  data["Paragraphs"]=strings.Split(data["Body"].(string),"\n\n")
  h,err:=template.New(name+".html.tmpl").Option("missingkey=error").ParseFiles(filepath.Join("emails",name+".html.tmpl"));if err!=nil{panic(err)}
  var out bytes.Buffer
  if err=h.Execute(&out,data);err!=nil{panic(err)}
  if strings.Contains(out.String(),"ZgotmplZ") {panic("unsafe fixture URL")}
  if strings.Contains(name,"request") && strings.Count(out.String(),">Review introduction</a>")!=1 {panic("expected one primary review CTA")}
  if !strings.Contains(name,"request") && strings.Contains(out.String(),"fixture-only") {panic("capability in non-request template")}
  if name=="first-request" && strings.Contains(out.String(),"has agreed to the introduction") {panic("premature acceptance")}
  if err=os.WriteFile(filepath.Join("rendered",name+".html"),out.Bytes(),0644);err!=nil{panic(err)}
  plain,err:=texttemplate.New(name+".txt.tmpl").Option("missingkey=error").ParseFiles(filepath.Join("emails",name+".txt.tmpl"));if err!=nil{panic(err)}
  var txt bytes.Buffer
  if err=plain.Execute(&txt,data);err!=nil{panic(err)}
  if err=os.WriteFile(filepath.Join("rendered",name+".txt"),txt.Bytes(),0644);err!=nil{panic(err)}
  hostile:=make(map[string]any);for k,v:=range data{hostile[k]=v}
  hostile["Paragraphs"]=[]string{"<script>alert('unsafe')</script> & facts"}
  hostile["SenderName"]="<script>alert('sender')</script>"
  out.Reset();if err=h.Execute(&out,hostile);err!=nil{panic(err)}
  if strings.Contains(out.String(),"<script>"){panic("unescaped user content")}
  incomplete:=make(map[string]any);for k,v:=range data{incomplete[k]=v};delete(incomplete,"Footer")
  out.Reset();if h.Execute(&out,incomplete)==nil{panic("missing required field accepted")}
  fmt.Println(name+": HTML/text rendered; escaping and required fields verified")
 }
}
