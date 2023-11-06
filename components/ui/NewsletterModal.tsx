import { ImageWidget } from "apps/admin/widgets.ts";
import Icon from "$store/components/ui/Icon.tsx";
import { invoke } from "$store/runtime.ts";
import { useSignal } from "@preact/signals";
import type { JSX } from "preact";
import { useEffect, useRef } from "preact/compat";
import { getCookies } from "std/http/mod.ts";

export interface INewsletterInputProps {
  /**
   * @title Hide input?
   */
  show?: boolean;
  /**
   * @title placeholder
   */
  placeholder?: string;
}

export interface INewsletterFormProps {
  email: INewsletterInputProps;
  name: INewsletterInputProps;
  button: {
    /**
     * @title button label?
     * @default cadastrar
     */
    label?: string;
  };
}

export interface Props {
  /**
   * @title Newsletter Form
   */
  form: INewsletterFormProps;
  /**
   * @title newsletter message text?
   * @format html
   */
  text: string;

  /**
   * @title Days to reopen modal if it is registered
   */
  modalSignExpiredDate: number;

  /**
   * @title Days to reopen moda if it is closed
   */
  modalCloseExpiredDate: number;
  logo: {
    image: ImageWidget;
    description: string;
  };
  isOpen: boolean;
}

interface InputNewletterProps {
  name: string;
  placeholder: string;
  type: string;
  required: boolean;
}

export const loader = (props: Props, req: Request) => {
  const cookies = getCookies(req.headers);
  const cookieEmpty = req.method === "POST";
  const isOpen = cookieEmpty ? false : Boolean(!cookies["DecoNewsletterModal"]);

  return { ...props, isOpen };
};

function InputNewsletter(
  { name, placeholder, required, type }: InputNewletterProps,
) {
  return (
    <input
      name={name}
      type={type}
      class="input lg:h-12 h-9 px-5 join-item w-full mb-2.5 first:mt-5 border-2 border-neutral rounded-full placeholder:text-placeholder !outline-none lg:text-base text-xs"
      placeholder={placeholder}
      required={required}
    />
  );
}

function NewsletterModal(
  {
    isOpen,
    form,
    logo,
    text,
    modalSignExpiredDate,
    modalCloseExpiredDate,
  }: Props,
) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const loading = useSignal(false);
  const success = useSignal(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    }
  }, [isOpen]);

  const handleSubmit: JSX.GenericEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      loading.value = true;

      const email =
        (e.currentTarget.elements.namedItem("email") as RadioNodeList)?.value;

      let name = "";

      if (form?.name?.show) {
        name = (e.currentTarget.elements.namedItem("name") as RadioNodeList)
          ?.value;
      }

      await invoke.vtex.actions.newsletter.subscribe({ email, name });
    } finally {
      loading.value = false;
      success.value = true;

      setCookieOnCloseModal("registered", modalSignExpiredDate);

      setTimeout(() => {
        success.value = false;
        modalRef.current?.close();
      }, 2000);
    }
  };

  const setCookieOnCloseModal = (
    cookieValue: string,
    expirationSeconds: number,
  ) => {
    // deno-lint-ignore no-var
    var date = new Date();

    date.setTime(date.getTime() + (expirationSeconds * 24 * 60 * 60 * 1000));
    // deno-lint-ignore no-var
    var expires = "expires=" + date.toUTCString();

    document.cookie = "DecoNewsletterModal" + "=" + cookieValue + ";" +
      expires +
      ";path=/";
  };

  const emailInput = !form?.email?.show
    ? (
      <InputNewsletter
        name="email"
        required
        type="email"
        placeholder={form?.email?.placeholder || "E-mail"}
      />
    )
    : null;

  const nameInput = !form?.name?.show
    ? (
      <InputNewsletter
        name="name"
        type="text"
        placeholder={form?.name?.placeholder || "Nome"}
        required
      />
    )
    : null;

  return (
    <>
      <dialog
        ref={modalRef}
        class="modal bg-primary-content bg-opacity-5"
      >
        <form method="dialog" class="modal-box overflow-visible p-10">
          <div class="flex text-secondary-content justify-center items-center absolute right-2 -top-10">
            <p class="font-normal">Não quero</p>

            <button
              onClick={() =>
                setCookieOnCloseModal("closed", modalCloseExpiredDate)}
              class="btn btn-sm btn-circle btn-ghost focus:outline-none"
              aria-label="Fechar"
            >
              <Icon
                id="XMark"
                width={20}
                height={20}
                strokeWidth={1.8}
              />
            </button>
          </div>
          {success.value
            ? (
              <div class="lg:text-xl text-left text-base-100">
                E-mail cadastrado com sucesso!
              </div>
            )
            : (
              <>
                <div class="flex items-center justify-center w-full">
                  <img
                    src={logo.image}
                    width={120}
                    height={27}
                    alt={logo.description}
                    loading="lazy"
                  />
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: text }}
                  class="text-base lg:text-xl text-center text-base-100 lg:pr-0"
                />
                <form
                  class="w-full form-control"
                  onSubmit={handleSubmit}
                >
                  <div class="text-center">
                    {nameInput}
                    {emailInput}
                    <button
                      style={{
                        minWidth: "150px",
                      }}
                      type="submit"
                      class="capitalize md:ml-5 mt-2.5 font-semibold btn rounded-full join-item btn-primary bg-white hover:bg-white/90 text-black duration-150 transition-colors"
                      disabled={loading}
                    >
                      {form?.button?.label || "Cadastrar"}
                    </button>
                  </div>
                </form>
              </>
            )}
        </form>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() =>
              setCookieOnCloseModal("closed", modalCloseExpiredDate)}
          >
            fechar
          </button>
        </form>
      </dialog>
      )
    </>
  );
}

export default NewsletterModal;
