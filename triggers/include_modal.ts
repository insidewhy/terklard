import { Trigger } from "https://deno.land/x/deno_slack_sdk@2.7.0/types.ts";
import { IncludeModalWorkflow } from "../workflows/include_modal.ts";

const includeModalTrigger: Trigger<typeof IncludeModalWorkflow.definition> = {
  type: "shortcut",
  name: "Include in Standup",
  description: "Include a user back in standup lists",
  workflow: `#/workflows/${IncludeModalWorkflow.definition.callback_id}`,
  inputs: {
    channel_id: {
      value: "{{data.channel_id}}",
    },
    user_id: {
      value: "{{data.user_id}}",
    },
    interactivity: {
      value: "{{data.interactivity}}",
    },
  },
};

export default includeModalTrigger;
