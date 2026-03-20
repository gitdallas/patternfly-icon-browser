import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
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
import { DownloadIcon } from "@patternfly/react-icons";
import * as Icons from "@patternfly/react-icons";

const getAllIconNames = (): string[] => {
  return Object.keys(Icons)
    .filter((key) => {
      const value = Icons[key as keyof typeof Icons];
      return typeof value === "function" && key.endsWith("Icon");
    })
    .sort();
};

// Function to extract SVG markup from an icon component
const getIconSvg = async (iconName: string): Promise<string | null> => {
  const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType;
  if (!IconComponent) return null;

  // Create a temporary div to render the icon
  const root = document.createElement('div');
  root.style.position = 'absolute';
  root.style.left = '-9999px';
  root.style.top = '-9999px';
  document.body.appendChild(root);

  // Render the icon component
  const reactElement = React.createElement(IconComponent);
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(reactElement);

  // Wait for render and extract SVG
  return new Promise((resolve) => {
    setTimeout(() => {
      const svgElement = root.querySelector('svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        resolve(svgString);
      } else {
        resolve(null);
      }
      reactRoot.unmount();
      document.body.removeChild(root);
    }, 0);
  });
};

// Function to convert SVG to PNG and download
const downloadIconAsPng = async (iconName: string) => {
  const svgString = await getIconSvg(iconName);
  if (!svgString) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 64;
  canvas.height = 64;

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, 64, 64);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${iconName.replace(/Icon$/, '').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  img.src = svgUrl;
};

// Function to download SVG
const downloadIconAsSvg = async (iconName: string) => {
  const svgString = await getIconSvg(iconName);
  if (!svgString) return;

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${iconName.replace(/Icon$/, '').toLowerCase()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function PatternflyIconBrowser() {
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rhUiOnly, setRhUiOnly] = useState(false);

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

  const filteredIcons = allIconNames.filter((name) => {
    const matchesSearch = !search.trim() || name.toLowerCase().includes(search.toLowerCase());
    const matchesRhUi = !rhUiOnly || name.startsWith("RhUi");
    return matchesSearch && matchesRhUi;
  });

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
                    PF Icons as of @patternfly/react-icons ^6.5.0-prerelease.39
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
            <Switch
              id="rhui-only-switch"
              label="RhUi Icons only"
              isChecked={rhUiOnly}
              onChange={(_event, checked) => setRhUiOnly(checked)}
            />
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
        title="Icon Details"
      >
        <ModalBody>
          <Flex
            direction={{ default: "column" }}
            spaceItems={{ default: "spaceItemsMd" }}
          >
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
              <FlexItem flex={{ default: "flex_1" }}>
                <Content>
                  <Content component="small">
                    <code style={{ fontFamily: "monospace" }}>
                      import {"{"} {selectedIcon} {"}"} from
                      '@patternfly/react-icons'
                    </code>
                  </Content>
                </Content>
              </FlexItem>
            </Flex>
            <Flex spaceItems={{ default: "spaceItemsSm" }}>
              <FlexItem>
                <Button variant="secondary" onClick={handleCopyImport}>
                  Copy Import
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="secondary"
                  onClick={() => selectedIcon && downloadIconAsSvg(selectedIcon)}
                  icon={<DownloadIcon />}
                >
                  SVG
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="secondary"
                  onClick={() => selectedIcon && downloadIconAsPng(selectedIcon)}
                  icon={<DownloadIcon />}
                >
                  PNG
                </Button>
              </FlexItem>
            </Flex>
          </Flex>
        </ModalBody>
      </Modal>
    </Page>
  );
}

export default PatternflyIconBrowser;
