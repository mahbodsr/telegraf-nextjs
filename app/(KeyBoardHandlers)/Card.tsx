import Badge from "../_components/Badge";
import Button from "../_components/Button";

const Card = ({
  filename,
  caption,
  link,
  createdAt,
}: {
  filename: string;
  caption: string;
  link: string;
  createdAt: number;
}) => (
  <div className="p-10 rounded-3xl w-full ring-1 ring-black/10 text-black h-full inline-flex flex-col">
    <h1 className="font-bold text-3xl mb-8 text-left text-ellipsis overflow-hidden">
      <div>{filename}</div>
      <Badge color="primary">
        Expires at {new Date(createdAt).toLocaleTimeString("fa-IR-u-nu-latn")}
      </Badge>
    </h1>
    <div className="text-xl whitespace-pre text-wrap flex-1 rtl overflow-auto text-ellipsis">
      {caption}
    </div>
    <Button
      prefetch={false}
      href={link}
      className="w-full mt-2"
      color="secondary"
      soft
    >
      Watch
    </Button>
  </div>
);

export default Card;
