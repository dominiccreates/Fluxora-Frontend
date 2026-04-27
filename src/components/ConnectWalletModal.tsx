import { MouseEvent, useEffect, useRef } from "react";
import styles from "./ConnectWalletModal.module.css";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectFreighter?: () => void;
  onConnectAlbedo?: () => void;
  onConnectWalletConnect?: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function ConnectWalletModal({
  isOpen,
  onClose,
  onConnectFreighter,
  onConnectAlbedo,
  onConnectWalletConnect,
}: ConnectWalletModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") {
        return;
      }

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const walletOptions: WalletOption[] = [
    {
      id: "freighter",
      name: "Freighter",
      description: "Recommended browser extension for Stellar wallets.",
      icon: "🚀",
      action: onConnectFreighter ?? (() => {}),
    },
    {
      id: "albedo",
      name: "Albedo",
      description: "Open in-browser wallet for quick secure approvals.",
      icon: "⭐",
      action: onConnectAlbedo ?? (() => {}),
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Pair with compatible mobile wallets via QR.",
      icon: "🔗",
      action: onConnectWalletConnect ?? (() => {}),
    },
  ];

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        id="connect-wallet-modal"
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-wallet-modal-title"
        aria-describedby="connect-wallet-modal-description"
      >
        {/* Close button */}
        <button
          type="button"
          ref={closeButtonRef}
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close wallet connection dialog"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>Step 1 of 1</span>
          <h2 id="connect-wallet-modal-title" className={styles.title}>
            Choose your wallet
          </h2>
          <p id="connect-wallet-modal-description" className={styles.subtitle}>
            Select a provider below to connect. You will review and approve the
            request in your wallet.
          </p>
        </div>

        {/* Wallet options */}
        <div
          className={styles.walletList}
          role="list"
          aria-label="Wallet providers"
        >
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              type="button"
              className={styles.walletOption}
              onClick={wallet.action}
              aria-label={`Connect with ${wallet.name}`}
              role="listitem"
            >
              <div className={styles.walletIcon} aria-hidden="true">
                {wallet.icon}
              </div>
              <div className={styles.walletInfo}>
                <div className={styles.walletName}>{wallet.name}</div>
                <div className={styles.walletDescription}>
                  {wallet.description}
                </div>
              </div>
              <svg
                className={styles.chevron}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          By continuing, you agree to Fluxora&apos;s{" "}
          <a href="/terms" className={styles.termsLink}>
            Terms of Service
          </a>
          .
        </p>
      </div>
    </div>
  );
}
