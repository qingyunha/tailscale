// Copyright (c) Tailscale Inc & AUTHORS
// SPDX-License-Identifier: BSD-3-Clause

import cx from "classnames"
import React, { useMemo } from "react"
import { ReactComponent as ArrowRight } from "src/assets/icons/arrow-right.svg"
import { ReactComponent as Machine } from "src/assets/icons/machine.svg"
import AddressCard from "src/components/address-copy-card"
import ExitNodeSelector from "src/components/exit-node-selector"
import { NodeData, NodeUpdaters } from "src/hooks/node-data"
import { pluralize } from "src/utils/util"
import { Link, useLocation } from "wouter"

export default function HomeView({
  readonly,
  node,
  nodeUpdaters,
}: {
  readonly: boolean
  node: NodeData
  nodeUpdaters: NodeUpdaters
}) {
  const [allSubnetRoutes, pendingSubnetRoutes] = useMemo(
    () => [
      node.AdvertisedRoutes?.length,
      node.AdvertisedRoutes?.filter((r) => !r.Approved).length,
    ],
    [node.AdvertisedRoutes]
  )

  return (
    <div className="mb-12 w-full">
      <h2 className="mb-3">This device</h2>
      <div className="-mx-5 card mb-9">
        <div className="flex justify-between items-center text-lg mb-5">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center inline-flex">
              <Machine />
            </div>
            <div className="ml-3">
              <h1>{node.DeviceName}</h1>
              <p className="text-gray-500 text-sm leading-[18.20px] flex items-center gap-2">
                <span
                  className={cx("w-2 h-2 inline-block rounded-full", {
                    "bg-green-300": node.Status === "Running",
                    "bg-gray-300": node.Status !== "Running",
                  })}
                />
                {node.Status === "Running" ? "Connected" : "Offline"}
              </p>
            </div>
          </div>
          <AddressCard
            triggerClassName="text-gray-800 text-lg leading-[25.20px]"
            v4Address={node.IPv4}
            v6Address={node.IPv6}
            shortDomain={node.DeviceName}
            fullDomain={`${node.DeviceName}.${node.TailnetName}`}
          />
        </div>
        {(node.Features["advertise-exit-node"] ||
          node.Features["use-exit-node"]) && (
          <ExitNodeSelector
            className="mb-5"
            node={node}
            nodeUpdaters={nodeUpdaters}
            disabled={readonly}
          />
        )}
        <Link className="link font-medium" to="/details">
          View device details &rarr;
        </Link>
      </div>
      <h2 className="mb-3">Settings</h2>
      <div className="grid gap-3">
        {node.Features["advertise-routes"] && (
          <SettingsCard
            link="/subnets"
            title="Subnet router"
            body="Add devices to your tailnet without installing Tailscale on them."
            badge={
              allSubnetRoutes
                ? {
                    text: `${allSubnetRoutes} ${pluralize(
                      "route",
                      "routes",
                      allSubnetRoutes
                    )}`,
                  }
                : undefined
            }
            footer={
              pendingSubnetRoutes
                ? `${pendingSubnetRoutes} ${pluralize(
                    "route",
                    "routes",
                    pendingSubnetRoutes
                  )} pending approval`
                : undefined
            }
          />
        )}
        {node.Features["ssh"] && (
          <SettingsCard
            link="/ssh"
            title="Tailscale SSH server"
            body="Run a Tailscale SSH server on this device and allow other devices in your tailnet to SSH into it."
            badge={
              node.RunningSSHServer
                ? {
                    text: "Running",
                    icon: (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    ),
                  }
                : undefined
            }
          />
        )}
        {/* TODO(sonia,will): hiding unimplemented settings pages until implemented */}
        {/* <SettingsCard
        link="/serve"
        title="Share local content"
        body="Share local ports, services, and content to your Tailscale network or to the broader internet."
      /> */}
      </div>
    </div>
  )
}

function SettingsCard({
  title,
  link,
  body,
  badge,
  footer,
  className,
}: {
  title: string
  link: string
  body: string
  badge?: {
    text: string
    icon?: JSX.Element
  }
  footer?: string
  className?: string
}) {
  const [, setLocation] = useLocation()

  return (
    <button
      className={cx("-mx-5 card cursor-pointer", className)}
      onClick={() => setLocation(link)}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="flex gap-2">
            <p className="text-gray-800 font-medium leading-tight mb-2">
              {title}
            </p>
            {badge && (
              <div className="h-5 px-2 bg-gray-100 rounded-full flex items-center gap-2">
                {badge.icon}
                <div className="text-gray-500 text-xs font-medium">
                  {badge.text}
                </div>
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm leading-tight">{body}</p>
        </div>
        <div>
          <ArrowRight className="ml-3" />
        </div>
      </div>
      {footer && (
        <>
          <hr className="my-3" />
          <div className="text-gray-500 text-sm leading-tight">{footer}</div>
        </>
      )}
    </button>
  )
}
