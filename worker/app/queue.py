from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable


JobProcessor = Callable[[dict], Awaitable[None]]


class WorkerQueue:
    def __init__(self, processor: JobProcessor, concurrency: int) -> None:
        self._processor = processor
        self._queue: asyncio.Queue[dict] = asyncio.Queue()
        self._concurrency = max(1, concurrency)
        self._tasks: list[asyncio.Task[None]] = []
        self._logger = logging.getLogger("worker.queue")

    async def start(self) -> None:
        if self._tasks:
            return
        for idx in range(self._concurrency):
            self._tasks.append(asyncio.create_task(self._run_loop(idx)))

    async def stop(self) -> None:
        for task in self._tasks:
            task.cancel()
        await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks.clear()

    async def enqueue(self, payload: dict) -> None:
        await self._queue.put(payload)

    async def _run_loop(self, worker_index: int) -> None:
        while True:
            payload = await self._queue.get()
            try:
                await self._processor(payload)
            except Exception:
                self._logger.exception(
                    "Background job failed in worker loop",
                    extra={"worker_index": worker_index, "job_id": payload.get("job_id")},
                )
            finally:
                self._queue.task_done()
