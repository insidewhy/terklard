import { Trigger } from "https://deno.land/x/deno_slack_sdk@2.7.0/types.ts";
import { ExcludeModalWorkflow } from "../workflows/exclude_modal.ts";

const excludeModalTrigger: Trigger<typeof ExcludeModalWorkflow.definition> = {
  type: "shortcut",
  name: "Exclude from Standup",
  description: "Exclude users from standup lists",
  workflow: `#/workflows/${ExcludeModalWorkflow.definition.callback_id}`,
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

export default excludeModalTrigger;
