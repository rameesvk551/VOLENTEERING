export const sampleRouteResponse = {
    success: true,
    jobId: '4838cb8a-011c-46e7-bd52-aff62f653ab2',
    optimizedOrder: [
        { placeId: 'ChIJl0aSWuDiDDkR0OxbZBEETuc', seq: 1 },
        { placeId: 'ChIJHwdPU73iDDkRJyADQJ4YfH0', seq: 2 },
        { placeId: 'ChIJVzsxsGDiDDkRO7evvxmOi1Q', seq: 3 }
    ],
    estimatedDurationMinutes: 192,
    totalDistanceMeters: 9392,
    legs: [
        {
            from: {
                placeId: 'ChIJl0aSWuDiDDkR0OxbZBEETuc',
                name: 'Lal Bangla Monument',
                lat: 28.6003359,
                lng: 77.23823260000002,
                seq: 1
            },
            to: {
                placeId: 'ChIJHwdPU73iDDkRJyADQJ4YfH0',
                name: 'Indira Gandhi Memorial Museum',
                lat: 28.5998927,
                lng: 77.2060499,
                seq: 2
            },
            travelType: 'walking',
            travelTimeSeconds: 320,
            distanceMeters: 4558,
            cost: 1.37,
            steps: [
                {
                    mode: 'fallback',
                    from: 'Lal Bangla Monument',
                    to: "Indira Gandhi Memorial Museum",
                    distanceMeters: 4558,
                    durationSeconds: 320
                }
            ],
            polyline: 'm_spu@wqgirC{FG}ZdTwcAvn@q@^gTxLk~B|qAiMhHiIvEgCrAkF`CmLlFsq@n[e|Ans@acAvf@srAbn@aAxDY|LvIvXpOxf@`CbSC~SoEjSu@zA}Xlj@oFlKkFxKoAfCi@z@iI~PeZlj@yCzSe@~MJ~Bt@rN|@xKh@tG~q@rpB`IrKbDC|Cp@hCbBjBjCbAhDDx@N|BUnCI|@g@|Ao@xAD`Dl@dCbBzEpFxP~a@zuA|Mr`@zEfNxG`ShKzZtLv]zP~c@`Lh\\hD|Jx@vChCrCjB~AfBjAvFNlDRbHhAzCzB|RnLlDbEvEtH|AfEx@vERvHu@tH{A~E}BhE_FdG}F|EIrDFjEx@xCjDvJzSxl@l_|dAnZj~@jZ`z@bSpo@~@zCtBhFtBtCPTpDdCz@j@r@KlDH~AXzAf@tAt@lA`AhAnA~@xAr@bBd@jB^fCFlCIlC_@fCo@zBaAnBmAbBo@h@HdDRzCzA`EhInWhSxk@dSvh@`Lv^`InVpPrf@d[~|@pS|l@bFzOzB~GzB`BpBj@rEAjE|@`HdFtCVhFIvCa@v@Yr]mMz^oM{AqFkDwL',
            provider: 'osrm-fallback'
        },
        {
            from: {
                placeId: 'ChIJHwdPU73iDDkRJyADQJ4YfH0',
                name: 'Indira Gandhi Memorial Museum',
                lat: 28.5998927,
                lng: 77.2060499,
                seq: 2
            },
            to: {
                placeId: 'ChIJVzsxsGDiDDkRO7evvxmOi1Q',
                name: "Darya Khan's Tomb",
                lat: 28.5722418,
                lng: 77.21669349999999,
                seq: 3
            },
            travelType: 'walking',
            travelTimeSeconds: 404,
            distanceMeters: 4834,
            cost: 1.45,
            steps: [
                {
                    mode: 'fallback',
                    from: 'Indira Gandhi Memorial Museum',
                    to: "Darya Khan's Tomb",
                    distanceMeters: 4834,
                    durationSeconds: 404
                }
            ],
            polyline: 'ezqpu@cfhgrCjDvLzApFzKcEfi@cRnq@aTvQaHrT_Ib}@c\\hG}BtBw@fCk@bQcIfb@kOf]aMnwC{eAfLeEr[kLpAmCb@iDcGy{Cc@{Tg@iH}BcGdGG~H]vPw@peBoFxDAvKP|ANdYtBxh@lDpsAxHvZbBb[|AhXhBfQNzZqAtJQhDItCGtE@~a@JnTt@x_@pChZdClHpAnmDxp@tQtE|k@nP~EnAddA`[zFvBpg@hRhOlFn^vKz[rJvVrHb`@tDr_@tBzCRlN^vB@fGHrET`OfAhe@bC\\uDlHp@~Hl@|In@|HRbFc@xBSpCq@ry@q\\tLuDbPkEfVsOpBeBvBoClAeB~@kB`AaCp@aCTyAbAmD^uAl@gBr@{AhB{B~@e_AiIoH}@cCIeDPu_@L}Rv@onAvBep@xAmd@`B}p@oj@aI_Em@_bA_]oUgBof@mH',
            provider: 'osrm-fallback'
        }
    ],
    timeline: [
        {
            placeId: 'ChIJl0aSWuDiDDkR0OxbZBEETuc',
            seq: 1,
            arrivalTime: '2025-11-15T06:54:29.525Z',
            departureTime: '2025-11-15T07:54:29.525Z',
            visitDurationMinutes: 60
        },
        {
            placeId: 'ChIJHwdPU73iDDkRJyADQJ4YfH0',
            seq: 2,
            arrivalTime: '2025-11-15T07:59:49.525Z',
            departureTime: '2025-11-15T08:59:49.525Z',
            visitDurationMinutes: 60
        },
        {
            placeId: 'ChIJVzsxsGDiDDkRO7evvxmOi1Q',
            seq: 3,
            arrivalTime: '2025-11-15T09:06:33.525Z',
            departureTime: '2025-11-15T10:06:33.525Z',
            visitDurationMinutes: 60
        }
    ],
    routeGeometry: {
        legs: [
            {
                seq: 1,
                travelType: 'walking',
                polyline: 'm_spu@wqgirC{FG}ZdTwcAvn@q@^gTxLk~B|qAiMhHiIvEgCrAkF`CmLlFsq@n[e|Ans@acAvf@srAbn@aAxDY|LvIvXpOxf@`CbSC~SoEjSu@zA}Xlj@oFlKkFxKoAfCi@z@iI~PeZlj@yCzSe@~MJ~Bt@rN|@xKh@tG~q@rpB`IrKbDC|Cp@hCbBjBjCbAhDDx@N|BUnCI|@g@|Ao@xAD`Dl@dCbBzEpFxP~a@zuA|Mr`@zEfNxG`ShKzZtLv]zP~c@`Lh\\hD|Jx@vChCrCjB~AfBjAvFNlDRbHhAzCzB|RnLlDbEvEtH|AfEx@vERvHu@tH{A~E}BhE_FdG}F|EIrDFjEx@xCjDvJzSxl@l_|dAnZj~@jZ`z@bSpo@~@zCtBhFtBtCPTpDdCz@j@r@KlDH~AXzAf@tAt@lA`AhAnA~@xAr@bBd@jB^fCFlCIlC_@fCo@zBaAnBmAbBo@h@HdDRzCzA`EhInWhSxk@dSvh@`Lv^`InVpPrf@d[~|@pS|l@bFzOzB~GzB`BpBj@rEAjE|@`HdFtCVhFIvCa@v@Yr]mMz^oM{AqFkDwL'
            },
            {
                seq: 2,
                travelType: 'walking',
                polyline: 'ezqpu@cfhgrCjDvLzApFzKcEfi@cRnq@aTvQaHrT_Ib}@c\\hG}BtBw@fCk@bQcIfb@kOf]aMnwC{eAfLeEr[kLpAmCb@iDcGy{Cc@{Tg@iH}BcGdGG~H]vPw@peBoFxDAvKP|ANdYtBxh@lDpsAxHvZbBb[|AhXhBfQNzZqAtJQhDItCGtE@~a@JnTt@x_@pChZdClHpAnmDxp@tQtE|k@nP~EnAddA`[zFvBpg@hRhOlFn^vKz[rJvVrHb`@tDr_@tBzCRlN^vB@fGHrET`OfAhe@bC\\uDlHp@~Hl@|In@|HRbFc@xBSpCq@ry@q\\tLuDbPkEfVsOpBeBvBoClAeB~@kB`AaCp@aCTyAbAmD^uAl@gBr@{AhB{B~@e_AiIoH}@cCIeDPu_@L}Rv@onAvBep@xAmd@`B}p@oj@aI_Em@_bA_]oUgBof@mH'
            }
        ]
    },
    summary: {
        startsAt: '2025-11-15T06:54:29.525Z',
        endsAt: '2025-11-15T10:06:33.525Z',
        totalVisitMinutes: 180,
        totalTravelMinutes: 12
    },
    notes: 'Leg 1: realtime transport unavailable, used fallback matrix estimates. Leg 2: realtime transport unavailable, used fallback matrix estimates.',
    processingTime: '2730ms'
};
