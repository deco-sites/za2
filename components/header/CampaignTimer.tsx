import { useId } from "preact/hooks";
import {
  HTMLWidget as HTML,
  ImageWidget as LiveImage,
} from "apps/admin/widgets.ts";
import { Picture, Source } from "apps/website/components/Picture.tsx";

export interface Props {
  /**
   * @title Expires at date
   * @format datetime
   */
  expiresAt?: string;

  labels?: {
    /**
     * @title Text to show when expired
     */
    expired?: string;
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
  };

  text?: {
    /**
     * @title Text
     * @default Time left for a campaign to end wth a link
     */
    mobile?: HTML;
    /**
     * @title Text
     * @default Time left for a campaign to end wth a link
     */
    desktop?: HTML;
  };

  /**
   * @format color
   * @default #C0C0C0
   */
  backgroundHex?: string;
  /**
   * @format color
   * @default #C0C0C0
   */
  textHex?: string;
  hiddenCampaignTimer?: boolean;
}

const snippet = (expiresAt: string, rootId: string) => {
  const expirationDate = new Date(expiresAt).getTime();

  const getDelta = () => {
    const delta = expirationDate - new Date().getTime();

    const days = Math.floor(delta / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((delta % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  };

  const setValue = (id: string, value: number) => {
    const elem = document.getElementById(id);

    if (!elem) return;

    elem.style.setProperty("--value", value.toString());
  };

  setInterval(() => {
    const { days, hours, minutes, seconds } = getDelta();
    const isExpired = hours + minutes + seconds < 0;

    if (isExpired) {
      const expired = document.getElementById(`${rootId}::expired`);
      const counter = document.getElementById(`${rootId}::counter`);

      expired?.classList.remove("hidden");
      counter?.classList.add("hidden");
    } else {
      setValue(`${rootId}::days`, days);
      setValue(`${rootId}::hours`, hours);
      setValue(`${rootId}::minutes`, minutes);
      setValue(`${rootId}::seconds`, seconds);
    }
  }, 1000);
};

function CampaignTimer({
  expiresAt = `${new Date()}`,
  labels,
  text,
  textHex,
}: Props) {
  const id = useId();

  return (
    <>
      {text && (
        <div class="flex max-w-full lg:max-w-[420px] xl:max-w-[580px] text-center px-1 sm:px-6 md:px-8">
          <div class="text-[10px] sm:text-sm xl:text-xl leading-tight tracking-tighter block lg:hidden">
            <span
              dangerouslySetInnerHTML={{
                __html: text?.mobile ??
                  "Time left for a campaign to end wth a link",
              }}
            />
          </div>
          <div class="text-[10px] sm:text-sm xl:text-xl leading-tight tracking-tighter hidden lg:block">
            <span
              dangerouslySetInnerHTML={{
                __html: text?.desktop ??
                  "Time left for a campaign to end wth a link",
              }}
            />
          </div>
        </div>
      )}
      <div
        style={{ color: `${textHex}` }}
        class="flex items-center h-20"
      >
        <div class="flex flex-col items-center justify-center text-center sm:gap-1 min-w-full">
          {/* <h1 class="text-sm md:text-xl font-bold">Termina em:</h1> */}

          <div id={`${id}::expired`} class="hidden h-full text-center">
            <span class="flex items-center text-sm sm:text-2xl h-full">
              {labels?.expired || "Expired!"}
            </span>
          </div>

          <div id={`${id}::counter`}>
            <div class="flex sm:grid sm:grid-flow-col gap-2 text-center sm:auto-cols-max items-center font-bold uppercase px-2 sm:px-0">
              <div class="flex flex-col items-center justify-center text-center">
                <span class="countdown text-[10px] sm:text-xl md:text-3xl">
                  <span id={`${id}::days`} />
                </span>
                <span class="text-[8px] sm:text-[10px]">
                  {labels?.days || "Dias"}
                </span>
              </div>
              :
              <div class="flex flex-col items-center justify-center text-center">
                <span class="countdown text-[10px] sm:text-xl md:text-3xl">
                  <span id={`${id}::hours`} />
                </span>
                <span class="text-[8px] sm:text-[10px]">
                  {labels?.hours || "Horas"}
                </span>
              </div>
              <div>
                :
              </div>
              <div class="flex flex-col items-center justify-center text-center">
                <span class="countdown text-[10px] sm:text-xl md:text-3xl">
                  <span id={`${id}::minutes`} />
                </span>
                <span class="text-[8px] sm:text-[10px]">
                  {labels?.minutes || "Min"}
                </span>
              </div>
              <div>
                :
              </div>
              <div class="flex flex-col items-center justify-center text-center">
                <span class="countdown text-[10px] sm:text-xl md:text-3xl">
                  <span id={`${id}::seconds`} />
                </span>
                <span class="text-[8px] sm:text-[10px]">
                  {labels?.seconds || "Seg"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `(${snippet})("${expiresAt}", "${id}");`,
        }}
      />
    </>
  );
}

export default CampaignTimer;
