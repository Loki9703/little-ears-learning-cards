import DinosaurIllustration, { type DinosaurIllustrationProps } from "./DinosaurIllustration";

export default function TyrannosaurusIllustration(props: Omit<DinosaurIllustrationProps, "slug">) {
  return <DinosaurIllustration slug="tyrannosaurus" {...props} />;
}
