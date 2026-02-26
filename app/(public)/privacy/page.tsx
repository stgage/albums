export const metadata = {
  title: "Privacy Policy – Sam's Albums",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-zinc-500 text-sm mb-10">Last updated: February 2026</p>

      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold text-base mb-2">Overview</h2>
          <p>
            Sam&apos;s Albums is a personal music collection and community
            ranking app. This policy explains what data we collect and how we
            use it.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">
            Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong className="text-white">Account information</strong> — your
              name, email address, and profile picture when you sign in with
              Google or register with email and password.
            </li>
            <li>
              <strong className="text-white">Collection data</strong> — albums
              you add, ratings, reviews, and rankings you create.
            </li>
            <li>
              <strong className="text-white">Usage data</strong> — standard
              server logs (IP address, browser, pages visited) for security and
              debugging.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To create and manage your account</li>
            <li>To display your collection and activity on the site</li>
            <li>To calculate community rankings</li>
            <li>To improve the app</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">
            Google Sign-In
          </h2>
          <p>
            If you sign in with Google, we receive your name, email address, and
            profile picture from Google. We do not access your Google Drive,
            Gmail, contacts, or any other Google services. We only request basic
            profile information.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">
            Data Sharing
          </h2>
          <p>
            We do not sell, trade, or share your personal information with third
            parties except as required by law. Your collection and reviews are
            visible to other users of the app.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">
            Data Retention
          </h2>
          <p>
            Your account and collection data are retained as long as your
            account is active. You can request deletion of your account and data
            by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a
              href="mailto:stgage@gmail.com"
              className="text-purple-400 hover:text-purple-300"
            >
              stgage@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
