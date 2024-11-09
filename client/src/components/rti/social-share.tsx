import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon
} from 'react-share';
import { GHANA_COLORS } from "@/lib/constants";

interface SocialShareProps {
  title: string;
  description: string;
  url: string;
}

export function SocialShare({ title, description, url }: SocialShareProps) {
  const iconSize = 32;
  const iconBgStyle = { fill: GHANA_COLORS.green };

  return (
    <div className="flex gap-4 items-center">
      <span className="text-sm font-medium">Share:</span>
      <FacebookShareButton url={url} quote={title}>
        <FacebookIcon size={iconSize} bgStyle={iconBgStyle} />
      </FacebookShareButton>

      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={iconSize} bgStyle={iconBgStyle} />
      </TwitterShareButton>

      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={iconSize} bgStyle={iconBgStyle} />
      </WhatsappShareButton>

      <LinkedinShareButton url={url} title={title} summary={description}>
        <LinkedinIcon size={iconSize} bgStyle={iconBgStyle} />
      </LinkedinShareButton>
    </div>
  );
}
