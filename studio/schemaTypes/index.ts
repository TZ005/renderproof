import { codecProfile } from "./codecProfile";
import { compatibilityRule } from "./compatibilityRule";
import { containerProfile } from "./containerProfile";
import { decision } from "./decision";
import { deliveryProfile } from "./deliveryProfile";
import { pipelineRecipe } from "./pipelineRecipe";
import { sourceClaim } from "./sourceClaim";
import { sourceDocument } from "./sourceDocument";

export const schemaTypes = [
  sourceDocument,
  sourceClaim,
  codecProfile,
  containerProfile,
  compatibilityRule,
  deliveryProfile,
  pipelineRecipe,
  decision,
];
