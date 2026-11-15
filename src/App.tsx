/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <iframe
      src={`${import.meta.env.BASE_URL}codepatcher/index.html`}
      title="CodePatcher Pro"
      className="w-screen h-screen border-0 block"
    />
  );
}
