import { findFolderWidgetInjectionPoint } from "./geminiDom"

describe("findFolderWidgetInjectionPoint", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("uses the start of recents as the stable sidebar boundary", () => {
    document.body.innerHTML = `
      <side-navigation>
        <expandable-section data-test-id="notebooks-expandable-section" storagekey="notebooks">
          <a href="/notebook/one">Notebook</a>
        </expandable-section>
        <div class="section-divider"></div>
        <expandable-section id="recents" data-test-id="chats-expandable-section" storagekey="chats">
          <div data-test-id="expandable-section-content">
            <div class="expandable-section-content-inner">
              <div class="chat-history">
                <div class="chat-history-list"></div>
              </div>
            </div>
          </div>
        </expandable-section>
      </side-navigation>
    `

    const recents = document.getElementById("recents")
    expect(findFolderWidgetInjectionPoint()).toEqual({
      element: recents,
      position: "before"
    })
  })

  it("falls back to the last notebook item instead of the sidebar layout", () => {
    document.body.innerHTML = `
      <side-navigation>
        <div class="sidebar-layout">
          <section class="notebook-area">
            <gem-nav-list-item id="notebook-one">
              <a href="/notebook/one">Notebook one</a>
            </gem-nav-list-item>
            <gem-nav-list-item id="notebook-two">
              <a href="/notebook/two">Notebook two</a>
            </gem-nav-list-item>
          </section>
          <footer class="account-footer">Account</footer>
        </div>
      </side-navigation>
    `

    const lastNotebook = document.getElementById("notebook-two")
    expect(findFolderWidgetInjectionPoint()).toEqual({
      element: lastNotebook,
      position: "after"
    })
  })

  it("waits when only a transient Gems control has rendered", () => {
    document.body.innerHTML = `
      <side-navigation>
        <div data-test-id="gems-chip">Gems</div>
      </side-navigation>
    `

    expect(findFolderWidgetInjectionPoint()).toBeNull()
  })
})
