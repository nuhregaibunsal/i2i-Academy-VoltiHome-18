package com.voltwise.core.common.state;

import com.voltwise.core.common.config.IgniteConfig;
import org.apache.ignite.cache.query.ScanQuery;
import org.apache.ignite.client.ClientCache;
import org.apache.ignite.client.IgniteClient;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Consumer;

@Component
public class LiveStateStore {

    private final IgniteClient igniteClient;
    private final ConcurrentHashMap<Long, Lock> homeLocks = new ConcurrentHashMap<>();

    public LiveStateStore(IgniteClient igniteClient) {
        this.igniteClient = igniteClient;
    }

    private ClientCache<Long, HomeLiveState> cache() {
        return igniteClient.getOrCreateCache(IgniteConfig.HOME_STATE_CACHE);
    }

    public void put(HomeLiveState state) {
        cache().put(state.getHomeId(), state);
    }

    public void remove(Long homeId) {
        cache().remove(homeId);
    }

    public Optional<HomeLiveState> find(Long homeId) {
        return Optional.ofNullable(cache().get(homeId));
    }

    public List<HomeLiveState> findAll() {
        List<HomeLiveState> result = new ArrayList<>();
        cache().query(new ScanQuery<Long, HomeLiveState>())
                .forEach(entry -> result.add(entry.getValue()));
        return result;
    }

    public boolean contains(Long homeId) {
        return cache().containsKey(homeId);
    }

    public HomeLiveState mutate(Long homeId, Consumer<HomeLiveState> mutation) {
        Lock lock = homeLocks.computeIfAbsent(homeId, id -> new ReentrantLock());
        lock.lock();
        try {
            ClientCache<Long, HomeLiveState> cache = cache();
            HomeLiveState state = cache.get(homeId);
            if (state == null) {
                return null;
            }
            mutation.accept(state);
            cache.put(homeId, state);
            return state;
        } finally {
            lock.unlock();
        }
    }
}
