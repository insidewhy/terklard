import { Manifest } from "https://deno.land/x/deno_slack_sdk@2.7.0/mod.ts";
import { StandupFunction } from "./functions/standup.ts";
import { StandupExcludeFunction } from "./functions/standup_exclude.ts";
import { StandupIncludeFunction } from "./functions/standup_include.ts";
import { StandupWorkflow } from "./workflows/standup.ts";
import { ExcludeModalWorkflow } from "./workflows/exclude_modal.ts";
import { IncludeModalWorkflow } from "./workflows/include_modal.ts";
import { ExcludedUsersDatastore } from "./datastores/excluded_users.ts";

export default Manifest({
  name: "Standup Bot",
  description: "A Slack bot for managing daily standups",
  icon: "assets/icon.png",
  functions: [StandupFunction, StandupExcludeFunction, StandupIncludeFunction],
  workflows: [StandupWorkflow, ExcludeModalWorkflow, IncludeModalWorkflow],
  datastores: [ExcludedUsersDatastore],
  outgoingDomains: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "channels:read",
    "groups:read",
    "mpim:read",
    "im:read",
    "users:read",
    "datastore:read",
    "datastore:write",
  ],
});
