import abc
import logging
class AbstractAgent(abc.ABC):
    def __init__(self, memory_url: str):
        self.memory_url = memory_url
        self.logger = logging.getLogger("InfinityAgent")
    @abc.abstractmethod
    def execute(self, event):
        pass
