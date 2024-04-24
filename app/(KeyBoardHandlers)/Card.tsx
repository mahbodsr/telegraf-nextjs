import Badge from "../_components/Badge";
import Button from "../_components/Button";
import CountDown from "../_components/CountDown";

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
}) => {
  return (
    <div className="p-10 rounded-3xl w-full ring-1 ring-black/10 text-black h-full inline-flex flex-col">
      <h1>
        <div className="font-bold text-3xl mb-8 text-left text-ellipsis overflow-hidden max-w-full">
          {filename}
        </div>
        <Badge color="primary" suppressHydrationWarning={true}>
          Expires in <CountDown expiresAt={new Date(createdAt + 86400000).getTime()} />
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
};

export default Card;
