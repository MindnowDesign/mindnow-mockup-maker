declare namespace google.accounts.id {
  interface IdConfiguration {
    client_id: string;
    login_uri?: string;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
    use_fedcm_for_prompt?: boolean;
    callback?: (response: CredentialResponse) => void;
  }

  interface CredentialResponse {
    credential: string;
    select_by?: string;
  }

  interface GsiButtonConfiguration {
    type?: "standard" | "icon";
    theme?: "outline" | "filled_blue" | "filled_black";
    size?: "large" | "medium" | "small";
    text?: "signin_with" | "signup_with" | "continue_with" | "signin";
    width?: string | number;
    shape?: "rectangular" | "pill" | "circle" | "square";
    logo_alignment?: "left" | "center";
  }

  function initialize(config: IdConfiguration): void;
  function renderButton(
    parent: HTMLElement,
    options: GsiButtonConfiguration
  ): void;
}

interface Window {
  google?: {
    accounts?: {
      id?: typeof google.accounts.id;
    };
  };
}
