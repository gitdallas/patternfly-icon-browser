import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  Icon,
  Modal,
  ModalBody,
  ModalVariant,
  Page,
  PageSection,
  SearchInput,
  Stack,
  StackItem,
  Switch,
  Title,
} from "@patternfly/react-core";
import * as Icons from "@patternfly/react-icons";

const getAllIconNames = (): string[] => {
  return Object.keys(Icons)
    .filter((key) => {
      const value = Icons[key as keyof typeof Icons];
      return typeof value === "function" && key.endsWith("Icon");
    })
    .sort();
};

function PatternflyIconBrowser() {
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pf-theme-dark");
    if (saved !== null) {
      const dark = saved === "true";
      setIsDarkMode(dark);
      document.documentElement.classList.toggle("pf-v6-theme-dark", dark);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle(
        "pf-v6-theme-dark",
        prefersDark
      );
    }
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    document.documentElement.classList.toggle("pf-v6-theme-dark", checked);
    localStorage.setItem("pf-theme-dark", checked.toString());
  };

  const allIconNames = getAllIconNames();

  const filteredIcons = search.trim()
    ? allIconNames.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      )
    : allIconNames;

  const handleCopyImport = () => {
    if (selectedIcon) {
      const importStatement = `import { ${selectedIcon} } from '@patternfly/react-icons'`;
      navigator.clipboard.writeText(importStatement);
    }
  };

  const SelectedIconComponent: React.ComponentType | null = selectedIcon
    ? (Icons[selectedIcon as keyof typeof Icons] as React.ComponentType)
    : null;

  return (
    <Page sidebar={null}>
      <PageSection isFilled>
        <Stack hasGutter>
          <StackItem>
            <Flex
              spaceItems={{ default: "spaceItemsLg" }}
              alignItems={{ default: "alignItemsCenter" }}
            >
              <FlexItem flex={{ default: "flex_1" }}>
                <Content>
                  <Title headingLevel="h1">PatternFly Icon Browser</Title>

                  <Content component="small">
                    PF Icons as of @patternfly/react-icons ^6.5.0-prerelease.29
                  </Content>
                </Content>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="dark-mode-switch"
                  label="Dark mode"
                  isChecked={isDarkMode}
                  onChange={(_event, checked) => toggleDarkMode(checked)}
                />
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <SearchInput
              placeholder="Search icons..."
              value={search}
              onChange={(_event, value) => setSearch(value)}
              onClear={() => setSearch("")}
            />
          </StackItem>
          <StackItem>
            <Content>
              <Content component="p">
                {filteredIcons.length}{" "}
                {filteredIcons.length === 1 ? "icon" : "icons"} found
              </Content>
            </Content>
          </StackItem>
          <StackItem isFilled id="main-content">
            <Gallery hasGutter minWidths={{ default: "120px" }}>
              {filteredIcons.map((iconName) => {
                const IconComponent = Icons[iconName as keyof typeof Icons] as
                  | React.ComponentType
                  | undefined;
                if (!IconComponent) return null;

                const isSelected = selectedIcon === iconName;

                return (
                  <GalleryItem key={iconName}>
                    <Card
                      isSelectable
                      isSelected={isSelected}
                      onClick={() => setSelectedIcon(iconName)}
                    >
                      <CardBody>
                        <Icon size="2xl">
                          <IconComponent />
                        </Icon>
                        <Content
                          component="small"
                          style={{
                            textAlign: "center",
                            wordBreak: "break-word",
                          }}
                        >
                          {iconName.replace(/Icon$/, "")}
                        </Content>
                      </CardBody>
                    </Card>
                  </GalleryItem>
                );
              })}
            </Gallery>
          </StackItem>
        </Stack>
      </PageSection>
      <Modal
        variant={ModalVariant.small}
        isOpen={selectedIcon !== null}
        onClose={() => setSelectedIcon(null)}
        title="Icon Import"
      >
        <ModalBody>
          <Flex
            spaceItems={{ default: "spaceItemsMd" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            <FlexItem>
              {SelectedIconComponent && (
                <div style={{ fontSize: "48px", lineHeight: 1 }}>
                  <SelectedIconComponent />
                </div>
              )}
            </FlexItem>
            <FlexItem>
              <Content>
                <Content component="small">
                  <code style={{ fontFamily: "monospace" }}>
                    import {"{"} {selectedIcon} {"}"} from
                    '@patternfly/react-icons'
                  </code>
                </Content>
              </Content>
            </FlexItem>
            <FlexItem>
              <Button variant="secondary" onClick={handleCopyImport}>
                Copy Import
              </Button>
            </FlexItem>
          </Flex>
        </ModalBody>
      </Modal>
    </Page>
  );
}

export default PatternflyIconBrowser;
